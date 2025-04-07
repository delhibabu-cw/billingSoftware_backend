const cloudinary = require('cloudinary').v2
const { cloudinaryName, cloudinaryApiKey, cloudinaryApiSecret } = require('../config/config');

cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret
  });

  module.exports = cloudinary