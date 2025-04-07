const responseMessages = require("../middlewares/response-messages");
const { errorHandlerFunction } = require("../middlewares/error");
const { paginationFn } = require("../utils/common_utils");
const { excel, bcrypt, mongoose } = require("../services/imports");
const validator = require("../validators/client");
const db = require("../models");

let skuCounter = 0;

function generateSKU(category, product) {
  console.log("category", category, "product", product);
  const categoryCode = category.substring(0, 3).toUpperCase();
  const productCode = product.substring(0, 3).toUpperCase();
  skuCounter += 1;
  const skuNumber = skuCounter.toString().padStart(3, "0");
  const sku = `${categoryCode}${productCode}${skuNumber}`;
  return sku;
}

module.exports = {
  createClient: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateCreateClient(
        req.body
      );
      if (error) {
        return res.clientError({
          msg: error,
        });
      }
      // Check if user with the same username already exists
      const existingUser = await db.client.findOne({
        userName: req.body.userName,
        isDeleted: false,
      });
      if (existingUser) {
        return res.clientError({ msg: "Username already exists." });
      }

      // Check if user with the same mobile number already exists
      const existingMobile = await db.client.findOne({
        mobile: req.body.mobile,
        isDeleted: false,
      });
      if (existingMobile) {
        return res.clientError({ msg: responseMessages[1009] });
      }

      console.log(validateData);
      console.log(req.body);

      req.body.unquieId = generateSKU(req.body.fullName, req.body.userName);
    //   req.body.password = await bcrypt.hashSync(req.body.password, 8);
      // req.body.userName = req.body.email;
      const data = await db.client.create(req.body);
      if (data && data._id) {
        return res.success({
          msg: responseMessages[1032],
          result: data,
        });
      }
      return res.clientError({
        msg: responseMessages[1017],
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  getClient: async (req, res) => {
    try {
      const _id = req.params.id;
      // const filterQuery = { isDeleted: false };
      const filterQuery = _id
        ? { _id, isDeleted: false }
        : { isDeleted: false };
      const unwanted = {
        isDeleted: 0,
        // password: 0,
      };
      const populateValues = { path: "role", select: "name" };
      if (_id) {
        const data = await db.client
          .findOne(filterQuery)
          .select(unwanted)
          .populate(populateValues);
        if (data) {
          return res.success({
            msg: responseMessages[1018],
            result: data,
          });
        }
        return res.clientError({
          msg: responseMessages[1015],
        });
      }
      const {
        perPage,
        currentPage,
        sortBy,
        role,
        search
      } = req.query;
      let sort = { createdAt: -1 };
      if (sortBy === "latest") sort = { createdAt: -1 };
      if (sortBy === "oldest") sort = { createdAt: 1 };

    // Dynamic filtering
    if (role) filterQuery.role = role;

    // Handle `search` input - look in multiple fields
    if (search) {
      const regex = new RegExp(search, "i"); // Case-insensitive search
      filterQuery.$or = [
        { fullName: regex },
        { email: regex },
        { mobile: regex },
        { clientId: regex },
      ];
    }

      const { rows, pagination } = await paginationFn(
        res,
        db.client,
        filterQuery,
        perPage,
        currentPage,
        populateValues,
        sort,
        unwanted
      );
      if (!rows.length) {
        return res.success({
          msg: responseMessages[1014],
          result: { rows },
        });
      }
      return res.success({
        msg: responseMessages[1018],
        result: { rows, pagination },
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  updateClient: async (req, res) => {
    try {
      const _id = req.params.id;
      const filterQuery = { isDeleted: false, _id };
      const checkExist = await db.client.findOne(filterQuery);
      if (!checkExist) {
        return res.clientError({
          msg: responseMessages[1015]
        })
      }
      // const updateData = {};
      // Object.keys(req.body).forEach((key) => {
      //   updateData[key] = req.body[key];
      // });
      // const data = await db.user.updateOne(filterQuery, updateData)
      const data = await db.client.updateOne(filterQuery, req.body)
      if (data.modifiedCount) {
        return res.success({
          msg: responseMessages[1019],
          result: data
        })
      }
      return res.clientError({
        msg: responseMessages[1020]
      })
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  deleteClient: async (req, res) => {
      try {
        const _id = req.params.id;
        const filterQuery = { isDeleted: false, _id };
        const checkExists = await db.client.findOne(filterQuery);
        if (!checkExists) {
          return res.clientError({
            msg: responseMessages[1015]
          })
        }
        const data = await db.client.updateOne(filterQuery, { isDeleted: true });
        if (data.modifiedCount) {
          return res.success({
            msg: responseMessages[1028],
            result: data
          });
        }
        return res.clientError({
          msg: responseMessages[1022]
        });
      } catch (error) {
        errorHandlerFunction(res, error);
      }
    },
};
