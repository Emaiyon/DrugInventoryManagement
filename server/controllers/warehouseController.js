const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
const getWarehouses = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
      ];
    }

    const warehouses = await Warehouse.find(query).populate('manager', 'name email');

    // Calculate live utilization based on current inventory batches
    const warehousesWithStats = await Promise.all(
      warehouses.map(async (wh) => {
        const batchCount = await Inventory.countDocuments({ warehouse: wh._id });
        const totalUnitsResult = await Inventory.aggregate([
          { $match: { warehouse: wh._id } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);
        const totalUnits = totalUnitsResult.length ? totalUnitsResult[0].total : 0;
        const utilizationPct = wh.capacity > 0 ? Math.min(100, Math.round((totalUnits / wh.capacity) * 100)) : 0;

        return {
          ...wh.toObject(),
          batchCount,
          totalUnits,
          utilizationPct,
        };
      })
    );

    res.json({
      success: true,
      warehouses: warehousesWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching warehouses',
    });
  }
};

// @desc    Get single warehouse by ID
// @route   GET /api/warehouses/:id
// @access  Private
const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id).populate('manager');
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
      });
    }

    const inventory = await Inventory.find({ warehouse: warehouse._id })
      .populate('drug', 'name genericName category')
      .populate('supplier', 'companyName')
      .limit(20);

    res.json({
      success: true,
      warehouse,
      inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching warehouse details',
    });
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouses
// @access  Private (ADMIN)
const createWarehouse = async (req, res) => {
  try {
    const { name, code, location, capacity, manager, managerName, contactNumber, temperatureControlled, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide warehouse name and code',
      });
    }

    const exists = await Warehouse.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse code already exists',
      });
    }

    const warehouse = await Warehouse.create({
      name,
      code: code.toUpperCase(),
      location: location || {},
      capacity: Number(capacity) || 50000,
      manager: manager || null,
      managerName: managerName || 'Warehouse Manager',
      contactNumber: contactNumber || '',
      temperatureControlled: temperatureControlled !== undefined ? temperatureControlled : true,
      status: status || 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      warehouse,
      message: 'Warehouse created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating warehouse',
    });
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private (ADMIN, WAREHOUSE_MANAGER)
const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
      });
    }

    const updated = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      warehouse: updated,
      message: 'Warehouse updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating warehouse',
    });
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private (ADMIN)
const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
      });
    }

    // Check if batches exist here
    const hasBatches = await Inventory.countDocuments({ warehouse: warehouse._id });
    if (hasBatches > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete warehouse while ${hasBatches} inventory batches are stored here. Reallocate stock first.`,
      });
    }

    await Warehouse.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Warehouse deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting warehouse',
    });
  }
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
