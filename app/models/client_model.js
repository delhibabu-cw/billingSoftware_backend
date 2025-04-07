const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
  'client',
  new mongoose.Schema(
    {
      fullName: { type: String, trim: true },
      userName: { type: String, trim: true, unique: true },
      email: { type: String, trim: true, lowercase: true },
      mobile: { type: String, trim: true },
      unquieId: { type: String, trim: true },
      gstPercentage: { type: Number, default: 0 },
      overAllGstToggle: { type: String, enum: ['on', 'off'], default: 'off' },
      customerToggle: { type: String, enum: ['on', 'off'], default: 'off' },
      employeeToggle: { type: String, enum: ['on', 'off'], default: 'off' },
      billPageDetails: { type: String, enum: ['yes', 'no'], default: 'no' },
      password : String,
      img_url : String,
      role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
  ),
  'clients'
);
