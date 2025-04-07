const responseMessages = require("../middlewares/response-messages");
const { errorHandlerFunction } = require("../middlewares/error");
const db = require("../models");
const validator = require("../validators/product");
const {
  paginationFn,
  createSlug,
  checkParams,
} = require("../utils/common_utils");
const { mongoose } = require("../services/imports");

let skuCounter = 0;

function generateSKU(category, product) {
  console.log("category:", category, "product:", product);

  // Helper function to extract the first three letters, ignoring leading numbers/spaces
  const extractCode = (name) => {
    const cleanName = name.replace(/^\d+\s*/, ""); // Remove leading numbers + spaces
    return cleanName.substring(0, 3).toUpperCase(); // Take first 3 letters
  };

  const categoryCode = extractCode(category);
  const productCode = extractCode(product);

  skuCounter += 1;
  const skuNumber = skuCounter.toString().padStart(3, "0");
  const sku = `PRO${productCode}${skuNumber}`;

  return sku;
}

module.exports = {
  create: async (req, res) => {
    try {
      const { error, validatedData } = await validator.validateCreateProduct(
        req.body
      );
      if (error) {
        return res.clientError({
          msg: error,
        });
      }

      const checkExists = await db.product.findOne({
        name: req.body.name,
        clientId: req.decoded.user_id,
        isDeleted: false,
      });
      if (checkExists) {
        return res.clientError({
          msg: responseMessages[1025],
        });
      }
      console.log(req.decoded);

      const category = await db.productCategory.findOne({
        _id: validatedData.category,
      });
      validatedData.productId = generateSKU(category.name, validatedData.name);
      validatedData.product_url = await createSlug(validatedData.name);

      const client = await db.client.findOne({ _id: req.decoded.user_id });
      if (!client) {
        return res.clientError({ msg: "Client not found." });
      }

     validatedData.clientId = client._id;
      console.log("validatedData--------", validatedData);

      const data = await db.product.create(validatedData);
      console.log("data----", data);
      const productId = data?._id;
      if (productId) {
        await db.productCategory.findByIdAndUpdate(validatedData.category, {
          $inc: { products: 1 },
           $push: { productItems: productId }, // ✅ Add product ID to productItems array
        });

        return res.success({
          msg: responseMessages[1023],
          result: data,
        });
      }

      return res.clientError({
        msg: responseMessages[1017],
      });
    } catch (error) {
      await session.endSession();
      session.endSession();
      errorHandlerFunction(res, error);
    }
  },
  get: async (req, res) => {
    try {
      const { error, validatedData } = await validator.validateGetProduct(req.query);
      if (error) {
        return res.clientError({ msg: error });
      }
      console.log("decode", req.decoded);
      console.log("validatedData", req.body);
  
      const _id = req.params.id;
      const filterQuery = { isDeleted: false, clientId: req.decoded.user_id };

      console.log('filterquery',filterQuery);
      
  
      const populateValues = [{ path: "category", select: "name" }];
  
      const selectValues = "-isDeleted -createdAt -updatedAt";
  
      // If a specific ID is provided, return only that product
      if (_id) {
        let data = await db.product
          .findOne({ ...filterQuery, _id })
          .populate(populateValues)
          .select(selectValues);

          console.log('singleData',data);
  
        if (!data) {
          return res.clientError({ msg: responseMessages[1014] });
        }
  
        return res.success({
          msg: responseMessages[1018],
          result: data,
        });
      }
  
      console.log(validatedData);
  
      // Apply additional filters from query params
      const { search, category, clientId } = validatedData;
      if (search) filterQuery.name = { $regex: search, $options: "i" };
      if (category) filterQuery.category = category;
      if (clientId) filterQuery.clientId = clientId;
  
      const sort = { createdAt: -1 };
  
      // Fetch all matching products without pagination
      let data = await db.product
        .find(filterQuery)
        .populate(populateValues)
        .select(selectValues)
        .sort(sort);

        console.log('arrayData',data);
        
  
      if (!data.length) {
        return res.success({
          msg: responseMessages[1014],
          result: [],
        });
      }
  
      return res.success({
        msg: responseMessages[1018],
        result: data,
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },  
  update: async (req, res) => {
    try {
      const { error, validatedData } = await validator.validateCreateProduct(
        req.body
      );
      if (error) {
        return res.clientError({
          msg: error,
        });
      }

      const _id = req.params.id;
      const clientId = req.decoded.user_id;
      const filterQuery = { isDeleted: false, _id, clientId };
      const checkExists = await db.product.findOne(filterQuery);
      if (!checkExists) {
        return res.clientError({
          msg: responseMessages[1014],
        });
      }

      if (validatedData.name) {
        validatedData.product_url = createSlug(validatedData.name);
      }
      const updData = {};
      Object.keys(validatedData).forEach((key) => {
        updData[key] = validatedData[key];
      });
      console.log("updData---", updData);

      const data = await db.product.updateOne(filterQuery, updData);
      if (data.modifiedCount) {
        return res.success({
          msg: responseMessages[1024],
          result: data,
        });
      }
      return res.clientError({
        msg: responseMessages[1020],
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  delete: async (req, res) => {
    try {
      const { error, validatedData } = await validator.validateDeleteProduct(
        req.query
      );
      if (error) {
        return res.clientError({
          msg: error,
        });
      }

      const _id = req.params.id;
      const clientId = req.decoded.user_id;
      const filterQuery = { isDeleted: false, _id, clientId };

      const checkExists = await db.product.findOne(filterQuery);
      if (!checkExists) {
        return res.clientError({
          msg: responseMessages[1014],
        });
      }

      if (checkExists.name !== validatedData.product_name) {
        return res.clientError({
          msg: "Product name was incorrect.",
        });
      }
      // if (checkExists.name.toLowerCase() !== validatedData.product_name.toLowerCase()) {
      //   return res.clientError({
      //     msg: 'Product name was incorrect.'
      //   });
      // }

      const data = await db.product.updateOne(
        { _id, clientId },
        { isDeleted: true }
      );
      if (data.modifiedCount) {
        await db.productCategory.findOneAndUpdate(checkExists.category, {
          $inc: { products: -1 },
        });
        return res.success({
          msg: responseMessages[1021],
          result: data,
        });
      }
      return res.clientError({
        msg: responseMessages[1022],
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
};
