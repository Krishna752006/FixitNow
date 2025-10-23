import ServicePricing from '../models/ServicePricing.js';

// Get all service prices
export const getAllServicePrices = async (req, res) => {
  try {
    const prices = await ServicePricing.find().sort({ serviceName: 1, subServiceTitle: 1 });
    res.json({
      success: true,
      data: prices,
    });
  } catch (error) {
    console.error('Get service prices error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get prices for a specific service
export const getServicePricesByCategory = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const prices = await ServicePricing.find({ serviceName }).sort({ subServiceTitle: 1 });
    res.json({
      success: true,
      data: prices,
    });
  } catch (error) {
    console.error('Get service category prices error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update service price (admin only)
export const updateServicePrice = async (req, res) => {
  try {
    const { serviceName, subServiceTitle, newPrice, description, duration } = req.body;
    const adminId = req.user._id;

    if (!serviceName || !subServiceTitle || newPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: serviceName, subServiceTitle, newPrice',
      });
    }

    if (newPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    let pricing = await ServicePricing.findOne({ serviceName, subServiceTitle });

    if (!pricing) {
      // Create new pricing entry
      pricing = new ServicePricing({
        serviceName,
        subServiceTitle,
        basePrice: newPrice,
        description,
        duration,
        updatedBy: adminId,
        priceHistory: [{
          price: newPrice,
          changedBy: adminId,
        }],
      });
    } else {
      // Update existing pricing
      pricing.priceHistory.push({
        price: pricing.basePrice,
        changedBy: adminId,
      });
      pricing.basePrice = newPrice;
      if (description) pricing.description = description;
      if (duration) pricing.duration = duration;
      pricing.updatedBy = adminId;
      pricing.updatedAt = new Date();
    }

    await pricing.save();

    res.json({
      success: true,
      message: 'Price updated successfully',
      data: pricing,
    });
  } catch (error) {
    console.error('Update service price error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get price history for a service
export const getPriceHistory = async (req, res) => {
  try {
    const { serviceName, subServiceTitle } = req.params;
    const pricing = await ServicePricing.findOne({ serviceName, subServiceTitle })
      .populate('updatedBy', 'firstName lastName email')
      .populate('priceHistory.changedBy', 'firstName lastName email');

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Service pricing not found',
      });
    }

    res.json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Bulk update prices
export const bulkUpdatePrices = async (req, res) => {
  try {
    const { updates } = req.body;
    const adminId = req.user._id;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates must be a non-empty array',
      });
    }

    const results = [];

    for (const update of updates) {
      const { serviceName, subServiceTitle, newPrice, description, duration } = update;

      if (!serviceName || !subServiceTitle || newPrice === undefined) {
        results.push({
          serviceName,
          subServiceTitle,
          success: false,
          message: 'Missing required fields',
        });
        continue;
      }

      try {
        let pricing = await ServicePricing.findOne({ serviceName, subServiceTitle });

        if (!pricing) {
          pricing = new ServicePricing({
            serviceName,
            subServiceTitle,
            basePrice: newPrice,
            description,
            duration,
            updatedBy: adminId,
            priceHistory: [{
              price: newPrice,
              changedBy: adminId,
            }],
          });
        } else {
          pricing.priceHistory.push({
            price: pricing.basePrice,
            changedBy: adminId,
          });
          pricing.basePrice = newPrice;
          if (description) pricing.description = description;
          if (duration) pricing.duration = duration;
          pricing.updatedBy = adminId;
          pricing.updatedAt = new Date();
        }

        await pricing.save();

        results.push({
          serviceName,
          subServiceTitle,
          success: true,
          newPrice,
        });
      } catch (err) {
        results.push({
          serviceName,
          subServiceTitle,
          success: false,
          message: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk update completed',
      data: results,
    });
  } catch (error) {
    console.error('Bulk update prices error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
