const Inventory = require('../models/Inventory');
const Drug = require('../models/Drug');
const Alert = require('../models/Alert');

// @desc    Get inventory with search, filters, pagination, sort
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res) => {
  try {
    const {
      search,
      status,
      warehouse,
      supplier,
      drugId,
      page = 1,
      limit = 10,
      sort = 'createdAt',
    } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (warehouse && warehouse !== 'ALL') {
      query.warehouse = warehouse;
    }

    if (supplier && supplier !== 'ALL') {
      query.supplier = supplier;
    }

    if (drugId) {
      query.drug = drugId;
    }

    if (search) {
      // Find matching drug IDs
      const matchingDrugs = await Drug.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const drugIds = matchingDrugs.map((d) => d._id);

      query.$or = [
        { batchNumber: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { drug: { $in: drugIds } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    let sortObj = { createdAt: -1 };
    if (sort === 'expiry_asc') sortObj = { expiryDate: 1 };
    if (sort === 'expiry_desc') sortObj = { expiryDate: -1 };
    if (sort === 'quantity_asc') sortObj = { quantity: 1 };
    if (sort === 'quantity_desc') sortObj = { quantity: -1 };

    const total = await Inventory.countDocuments(query);
    const inventory = await Inventory.find(query)
      .populate('drug', 'name genericName category dosageForm strength price')
      .populate('supplier', 'companyName contactPerson phone email')
      .populate('warehouse', 'name code location')
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      inventory,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching inventory',
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('drug')
      .populate('supplier')
      .populate('warehouse');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.json({
      success: true,
      inventory: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching inventory details',
    });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private (ADMIN, WAREHOUSE_MANAGER)
const createInventory = async (req, res) => {
  try {
    const {
      drug,
      batchNumber,
      quantity,
      unitPrice,
      supplier,
      warehouse,
      manufacturingDate,
      expiryDate,
      minimumStockLevel,
      location,
      notes,
    } = req.body;

    if (
      !drug ||
      !batchNumber ||
      quantity === undefined ||
      !unitPrice ||
      !supplier ||
      !warehouse ||
      !manufacturingDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required inventory fields',
      });
    }

    const item = new Inventory({
      drug,
      batchNumber,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      supplier,
      warehouse,
      manufacturingDate,
      expiryDate,
      minimumStockLevel: Number(minimumStockLevel) || 50,
      location: location || 'Aisle A, Shelf 1',
      notes: notes || '',
    });

    item.status = item.calculateStatus();
    await item.save();

    // Check if alert should be created immediately
    if (item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK') {
      const drugDoc = await Drug.findById(drug);
      await Alert.create({
        title: `${item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'} Alert`,
        message: `Batch ${batchNumber} of ${drugDoc ? drugDoc.name : 'drug'} has reached ${item.quantity} units.`,
        type: item.status,
        severity: item.status === 'OUT_OF_STOCK' ? 'CRITICAL' : 'WARNING',
        relatedItem: { modelName: 'Inventory', itemId: item._id },
      });
    }

    const populatedItem = await Inventory.findById(item._id)
      .populate('drug')
      .populate('supplier')
      .populate('warehouse');

    res.status(201).json({
      success: true,
      inventory: populatedItem,
      message: 'Inventory batch registered successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating inventory record',
    });
  }
};

// @desc    Update inventory record
// @route   PUT /api/inventory/:id
// @access  Private (ADMIN, WAREHOUSE_MANAGER)
const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    Object.assign(item, req.body);
    item.status = item.calculateStatus();
    await item.save();

    const updated = await Inventory.findById(item._id)
      .populate('drug')
      .populate('supplier')
      .populate('warehouse');

    res.json({
      success: true,
      inventory: updated,
      message: 'Inventory updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating inventory',
    });
  }
};

// @desc    Stock adjustment (quick + / - stock adjustment with audit note)
// @route   POST /api/inventory/:id/adjust
// @access  Private (ADMIN, WAREHOUSE_MANAGER, PHARMACY_MANAGER)
const adjustStock = async (req, res) => {
  try {
    const { adjustment, reason } = req.body; // adjustment can be positive or negative
    const numAdjustment = parseInt(adjustment, 10);

    if (isNaN(numAdjustment) || numAdjustment === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid non-zero adjustment amount',
      });
    }

    const item = await Inventory.findById(req.params.id).populate('drug');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    const newQuantity = item.quantity + numAdjustment;
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce stock below 0. Current stock is ${item.quantity}.`,
      });
    }

    item.quantity = newQuantity;
    if (reason) {
      item.notes = `${item.notes ? item.notes + ' | ' : ''}Adjustment: ${numAdjustment > 0 ? '+' : ''}${numAdjustment} (${reason}) by ${req.user.name} at ${new Date().toISOString()}`;
    }
    item.status = item.calculateStatus();
    await item.save();

    // Trigger alert if low or out of stock
    if (item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK') {
      await Alert.create({
        title: `${item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'} Warning`,
        message: `Inventory batch ${item.batchNumber} (${item.drug ? item.drug.name : 'Drug'}) adjusted to ${item.quantity} units.`,
        type: item.status,
        severity: item.status === 'OUT_OF_STOCK' ? 'CRITICAL' : 'WARNING',
        relatedItem: { modelName: 'Inventory', itemId: item._id },
      });
    }

    const populated = await Inventory.findById(item._id)
      .populate('drug')
      .populate('supplier')
      .populate('warehouse');

    res.json({
      success: true,
      inventory: populated,
      message: `Stock successfully adjusted by ${numAdjustment > 0 ? '+' : ''}${numAdjustment} units`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adjusting stock',
    });
  }
};

// @desc    Delete inventory record
// @route   DELETE /api/inventory/:id
// @access  Private (ADMIN)
const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Inventory batch removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting inventory record',
    });
  }
};

module.exports = {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  adjustStock,
  deleteInventory,
};
