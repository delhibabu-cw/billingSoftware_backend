const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
  'products',
  new mongoose.Schema(
    {
      name: { type: String, trim: true },
      product_url: { type: String, trim: true },
      productId: { type: String, trim: true },
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'client' },
      price: { type: Number, default: 0 },
      isgst: { type: Boolean, default: false },
      gstAmount: { type: Number, default: 0 },
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'product_category' },
      description: String,    
      img_url: String,
      quantity: { type: String },
      count: { type: Number, default: 0 },
      profitMargin: { type: Number, default: 0 },
      actualPrice: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
      productAddedFromStock: { type: String, enum: ['yes', 'no'], default: 'no' },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true, versionKey: false }
  ),
  'products'
);
