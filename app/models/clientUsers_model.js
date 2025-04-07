const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
  'clientUser',
  new mongoose.Schema(
    {
      fullName: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      dob: { type: Date },
      mobile: { type: String, trim: true },
      unquieId: { type: String, trim: true },
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'client' },
      subRole: { type: mongoose.Schema.Types.ObjectId, ref: 'subRole' },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
  ),
  'clientUser'
);
