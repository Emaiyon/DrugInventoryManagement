const Supplier = require('../models/Supplier');
const Order = require('../models/Order');

// @desc    Get all suppliers with search and status filter
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    const total = await Supplier.countDocuments(query);
    const suppliers = await Supplier.find(query)
      .populate('products', 'name genericName category price')
      .sort({ companyName: 1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      suppliers,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching suppliers',
    });
  }
};

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('products');
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    // Recent orders for this supplier
    const orders = await Order.find({ supplier: supplier._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      supplier,
      recentOrders: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching supplier details',
    });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private (ADMIN)
const createSupplier = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, address, city, country, licenseNumber, rating, status, products, paymentTerms } = req.body;

    if (!companyName || !contactPerson || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, contact person, email, and phone',
      });
    }

    const supplier = await Supplier.create({
      companyName,
      contactPerson,
      email,
      phone,
      address: address || '',
      city: city || '',
      country: country || 'United States',
      licenseNumber: licenseNumber || '',
      rating: Number(rating) || 4.8,
      status: status || 'ACTIVE',
      products: products || [],
      paymentTerms: paymentTerms || 'Net 30 Days',
    });

    res.status(201).json({
      success: true,
      supplier,
      message: 'Supplier registered successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating supplier',
    });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (ADMIN, SUPPLIER)
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('products');

    res.json({
      success: true,
      supplier: updated,
      message: 'Supplier updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating supplier',
    });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (ADMIN)
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Supplier removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting supplier',
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
