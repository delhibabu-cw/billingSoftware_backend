const exportsJson = {
    express: require('express'),
    mongoose: require('mongoose'),
    bodyParser: require('body-parser'),
    dotenv: require('dotenv'),
    cors: require('cors'),
    router: require('express').Router(),
    axios: require('axios'),
    jwt: require('jsonwebtoken'),
    asyncRedis: require('async-redis'),
    morgan: require('morgan'),
    helmet: require('helmet'),
    bcrypt: require('bcryptjs'),
    excel: require('exceljs'),
    nodemon: require('nodemon'),
    xss: require('xss-clean'),
    fs: require('fs'),
    Joi: require('joi'),
    AWS: require('aws-sdk'),
    multer: require('multer'),
    nodeMailer: require('nodemailer'),
    cloudinary: require('cloudinary'),
    path: require('path')
    // CloudinaryStorage: require('multer-storage-cloudinary').CloudinaryStorage
}
module.exports = {
    ...exportsJson,
    app: new exportsJson.express()
}


// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const axios = require('axios');
// const jwt = require('jsonwebtoken');
// const asyncRedis = require('async-redis');
// const morgan = require('morgan');
// const helmet = require('helmet');
// const bcrypt = require('bcryptjs');
// const excel = require('exceljs');
// const nodemon = require('nodemon');
// const xss = require('xss-clean');
// const fs = require('fs');
// const Joi = require('joi');
// const AWS = require('aws-sdk');
// const multer = require('multer');
// const nodeMailer = require('nodemailer');
// const cloudinary = require('cloudinary');
// // const { CloudinaryStorage } = require('multer-storage-cloudinary');

// // Initialize app
// const app = express();

// // Export everything
// module.exports = {
//     express,
//     mongoose,
//     bodyParser,
//     dotenv,
//     cors,
//     router: express.Router(),
//     axios,
//     jwt,
//     asyncRedis,
//     morgan,
//     helmet,
//     bcrypt,
//     excel,
//     nodemon,
//     xss,
//     fs,
//     Joi,
//     AWS,
//     multer,
//     nodeMailer,
//     cloudinary,
//     app
// };
