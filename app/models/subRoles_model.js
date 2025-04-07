const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
  'subRole',
  new mongoose.Schema(
    {
      name: { type: String, uppercase: true },
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'client' },
      description: String,
      userCount: { type: Number, default: 0 },
      status: { type: String, default: 'active' },
      isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true, versionKey: false }
  ),
  'subRole'
);
