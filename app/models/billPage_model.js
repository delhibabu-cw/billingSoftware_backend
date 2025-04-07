const { mongoose } = require('../services/imports')

module.exports = mongoose.model(
    'billPage',
    new mongoose.Schema(
        {
          clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'client' },
          header: {
            businessName: { type: String, trim: true },
            logo : {
              logo_Url: { type: String, trim: true },
              logoCircle: { type: Boolean,enum: ['true', 'false'], default: false },
              logoZoom: { type: Boolean,enum: ['true', 'false'], default: false },
              logoWidth: { type: String, trim: true },
              logoHeight: { type: String, trim: true },
            }, 
            address: String,
          },
          invoiceFields: {
            showInvoiceNo: { type: Boolean,enum: ['true', 'false'], default: false },
          },
          footer: {
            signature: String,
            terms: String
          },
          printSize: String,
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            isDeleted: { type: Boolean, default: false },
          },
        { timestamps: true, versionKey: false }
    ),
    'billPage'
);