const { mongoose } = require('../services/imports');

const purchaseBasedSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  quantity: { type: String },
  count: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  sellername: { type: String, trim: true },
  sellerDetails: { type: String, trim: true }
}, { _id: false });

const productBasedSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    productId: { type: String, trim: true, unique: true, sparse: true },
    _id: { type: String, trim: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'client' },
    price: { type: Number, default: 0 },
    isgst: { type: Boolean, default: false },
    gstAmount: { type: Number, default: 0 },
    quantity: { type: String },
    profitMargin: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    actualPrice: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'product_category' },
    description: { type: String },
    img_url: { type: String },
    countUpdates: [
      {
        price: { type: Number, default: 0 },
        profitMargin: { type: Number, default: 0 },
        gstAmount: { type: Number, default: 0 },
        actualPrice: { type: Number, default: 0 },
        count: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        totalAmount: { type: Number, default: 0 },
      }
    ],
    salesUpdates: [
      {
        count: { type: Number, required: true },
        actualPrice: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        profitMargin: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
        gstAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
      }
    ]
  }, { _id: false });
  


const stockSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'client', required: true },
  stockCategory: {
    type: String,
    enum: ['products', 'purchase'],
    required: true
  },
  products: productBasedSchema,
  purchase: purchaseBasedSchema,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('stocks', stockSchema, 'stocks');
