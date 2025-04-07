/* eslint-disable no-undef */
// const { express, fs } = require('../services/imports');
const express = require('express')
const fs = require('fs')

const router = express.Router();
const middleware = require('../middlewares');

// console.log(__dirname);

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== '__index.js' && file !== '__common.js')
  .forEach((file) => {
    // console.info(`Loading file ${file}`);
    if (file.slice(-3) === '.js') {
      const routesFile = require(`${__dirname}/${file}`);
      // console.log(routesFile);
      
      if (file === 'auth.js') {
        router.use('/', middleware.checkSetToken(), routesFile);
      } else {
        router.use('/', middleware.checkSetToken(), routesFile);
      }
    } else if (fs.lstatSync(`${__dirname}/${file}`).isDirectory() && fs.existsSync(`${__dirname}/${file}/__index.js`)) {
      const indexFile = require(`${__dirname}/${file}/__index.js`);
      router.use(indexFile.routes(), indexFile.allowedMethods());
    }
  });

module.exports = router;
