const mongoose = require('mongoose')

module.exports = mongoose.model(
    'product_category',
    new mongoose.Schema(
        {
            name: { type: String, trim: true },
            category_url: { type: String, trim: true },
            clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'client' },
            description: String,
            img_url: String,
            products: { type: Number, default: 0 },
            productItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }],
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            isDeleted: { type: Boolean, default: false }
        },
        { timestamps: true, versionKey: false }
    ),
    'product_category'
)