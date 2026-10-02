const mongoose = require('mongoose');

// Global cache for serverless environments (Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drugtrack';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log(`[Database] MongoDB Connected successfully to: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch(async (err) => {
        console.error(`[Database Error] Failed connecting to ${mongoUri}: ${err.message}`);

        // In local development, if external MongoDB is not running on port 27017,
        // offer automatic in-memory fallback for local testing convenience.
        if (process.env.NODE_ENV !== 'production') {
          try {
            console.log('[Database] Attempting fallback to mongodb-memory-server for local dev...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create({
              instance: { port: 27017, dbName: 'drugtrack' },
            }).catch(async () => {
              // If port 27017 is busy or restricted, let MongoMemoryServer choose an ephemeral port
              return await MongoMemoryServer.create({ instance: { dbName: 'drugtrack' } });
            });

            const fallbackUri = mongod.getUri();
            console.log(`[Database] In-memory MongoDB started at: ${fallbackUri}`);
            return await mongoose.connect(fallbackUri);
          } catch (memoryErr) {
            console.error('[Database Fallback Error]', memoryErr.message);
          }
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
