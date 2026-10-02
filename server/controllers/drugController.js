const Drug = require('../models/Drug');
const Inventory = require('../models/Inventory');

// @desc    Get all drugs with filtering, search, pagination
// @route   GET /api/drugs
// @access  Private
const getDrugs = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10, sort = 'name' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    const total = await Drug.countDocuments(query);
    const drugs = await Drug.find(query)
      .sort(sort === 'price_desc' ? { price: -1 } : sort === 'price_asc' ? { price: 1 } : { createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      drugs,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching drugs',
    });
  }
};

// @desc    Get single drug by ID
// @route   GET /api/drugs/:id
// @access  Private
const getDrugById = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found',
      });
    }

    // Also fetch associated inventory batches
    const batches = await Inventory.find({ drug: drug._id })
      .populate('warehouse', 'name code location')
      .populate('supplier', 'companyName contactPerson');

    res.json({
      success: true,
      drug,
      batches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching drug details',
    });
  }
};

// @desc    Create new drug
// @route   POST /api/drugs
// @access  Private (ADMIN, SUPPLIER)
const createDrug = async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      manufacturer,
      description,
      dosageForm,
      strength,
      price,
      prescriptionRequired,
      storageConditions,
      batchNumber,
      manufacturingDate,
      expiryDate,
      status,
    } = req.body;

    if (!name || !genericName || !category || !manufacturer || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, generic name, category, manufacturer, and price',
      });
    }

    const drug = await Drug.create({
      name,
      genericName,
      category,
      manufacturer,
      description: description || '',
      dosageForm: dosageForm || 'Tablet',
      strength: strength || '500mg',
      price: Number(price),
      prescriptionRequired: prescriptionRequired !== undefined ? prescriptionRequired : true,
      storageConditions: storageConditions || 'Store at 15-25°C',
      batchNumber: batchNumber || '',
      manufacturingDate: manufacturingDate || null,
      expiryDate: expiryDate || null,
      status: status || 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      drug,
      message: 'Drug created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating drug',
    });
  }
};

// @desc    Update drug
// @route   PUT /api/drugs/:id
// @access  Private (ADMIN, SUPPLIER)
const updateDrug = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found',
      });
    }

    const updatedDrug = await Drug.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      drug: updatedDrug,
      message: 'Drug updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating drug',
    });
  }
};

// @desc    Delete drug
// @route   DELETE /api/drugs/:id
// @access  Private (ADMIN)
const deleteDrug = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found',
      });
    }

    // Check if there are active inventory records
    const hasInventory = await Inventory.countDocuments({ drug: drug._id });
    if (hasInventory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete drug because ${hasInventory} inventory batch(es) reference it. Consider marking as DISCONTINUED.`,
      });
    }

    await Drug.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Drug deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting drug',
    });
  }
};

module.exports = {
  getDrugs,
  getDrugById,
  createDrug,
  updateDrug,
  deleteDrug,
};
