const { mongoose } = require('../services/imports')

module.exports = mongoose.model(
    'bills',
    new mongoose.Schema(
        {
            billNo: { type: String, trim: true, unique: true }, // Optional: For unique bill no.
            clientId: { type: String, trim: true },
            customer: {
              name: { type: String, trim: true, },
              mobile: { type: String, trim: true },
            },
            employee: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUser', set: (v) => v === "" ? null : v}, // Convert "" to null},
            selectedProducts: [
              {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
                name: String,
                quantity: { type: Number },
                total: { type: Number }, 
                price: { type: Number }, 
                gstAmount: { type: Number }, 
                productAddedFromStock: { type: String, enum: ['yes', 'no'], default: 'no' },
              },
            ],
            totalAmount: { type: Number, required: true },
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            isDeleted: { type: Boolean, default: false },
          },
        { timestamps: true, versionKey: false }
    ),
    'bills'
);