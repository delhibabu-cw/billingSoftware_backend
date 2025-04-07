const responseMessages = require("../middlewares/response-messages");
const { errorHandlerFunction } = require("../middlewares/error");
const db = require("../models");
const validator = require("../validators/productCategory");
const { roleNames } = require("../config/config");
const { createSlug } = require("../utils/common_utils");
const productCategory = db.productCategory;

module.exports = {
  create: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateCreate(req.body);
      if (error) {
        return res.clientError({
          msg: error,
        });
      }
      const checkExists = await productCategory.findOne({
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

      req.body.category_url = createSlug(req.body.name);

      const client = await db.client.findOne({ _id: req.decoded.user_id });
      if (!client) {
        return res.clientError({ msg: "Client not found." });
      }
      req.body.clientId = client._id;

      const data = await productCategory.create(req.body);
      if (data && data._id) {
        return res.success({
          msg: responseMessages[1016],
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
  get: async (req, res) => {
    try {
      const _id = req.params.id;
      const filter = {
        isDeleted: false,
        status: "active",
        clientId: req.decoded.user_id,
      };
      const populateValues = [
        { path: "productItems", select: "" },
        { path: "clientId", select: "fullName mobile clientId " },
      ]
      if (_id) {
        filter._id = _id;
        const data = await productCategory.findOne(filter).populate(populateValues);
        if (data) {
          return res.success({
            msg: responseMessages[1018],
            result: data,
          });
        }
        return res.clientError({
          msg: responseMessages[1014],
        });
      }
      if (req.decoded && req.decoded.roleType === roleNames.clientAd) {
        delete filter.status;
      }

      const { search,  } = req.body;
      if (search) filter.name = { $regex: search, $options: "i" };

      const sort = { createdAt: -1 };

      const data = await productCategory.find(filter).populate(populateValues).sort(sort);
      
      if (!data.length) {
        return res.success({
          msg: responseMessages[1014],
          result: data,
        });
      } else {
        return res.success({
          msg: responseMessages[1018],
          result: data,
        });
      }
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  update: async (req, res) => {
    try {
        const { name, description } = req.body;
        const clientId = req.decoded.user_id;
        const _id = req.params.id;

        // Validate input data
        const { error, validateData } = await validator.validateUpdate(req.body);
        if (error) {
            return res.clientError({ msg: error });
        }

        // Check if category exists and belongs to the user
        const checkExists = await productCategory.findOne({ _id, isDeleted: false, clientId });
        if (!checkExists) {
            return res.clientError({ msg: responseMessages[1014] }); // Category not found
        }

        // Ensure uniqueness of name per user
        const checkUnique = await productCategory.findOne({
            _id: { $ne: _id }, // Exclude the current category
            name,
            isDeleted: false,
            clientId, // Ensure uniqueness within the same user
        });

        if (checkUnique) {
            return res.clientError({ msg: `${name} is already taken.` });
        }

        // Prepare update data
        const updData = {};
        if (name) {
            updData.name = name;
            updData.category_url = createSlug(name);
        }
        if (description) updData.description = description;

        // Check if there's anything to update
        if (Object.keys(updData).length === 0) {
            return res.clientError({ msg: "No fields provided for update." });
        }

        // Update the category
        const data = await productCategory.updateOne({ _id, clientId }, { $set: updData });

        if (data.modifiedCount) {
            return res.success({ result: data, msg: responseMessages[1019] }); // Updated successfully
        }

        return res.clientError({ msg: responseMessages[1020] }); // No changes made
    } catch (error) {
        errorHandlerFunction(res, error);
    }
},
  delete: async (req, res) => {
    try {
      const { id: _id } = req.params;
      const clientId = req.decoded.user_id;

      const checkExists = await productCategory.findOne({
        _id,
        isDeleted: false,
        clientId,
      });
      if (!checkExists) {
        return res.clientError({
          msg: responseMessages[1014], // Category not found or does not belong to user
        });
      }

      const data = await productCategory.updateOne(
        { _id, clientId },
        { isDeleted: true }
      );

      if (data.modifiedCount) {

           // Also soft delete all products belonging to this category
      await db.product.updateMany(
        { category: _id, isDeleted: false }, // Only update non-deleted products
        { isDeleted: true }
      );

        return res.success({
          msg: responseMessages[1021], // Successfully deleted
          result: data,
        });
      }

      return res.clientError({
        msg: responseMessages[1022], // Unable to delete
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },

  status: async (req, res) => {
    try {
      const _id = req.params.id;
      const filter = { isDeleted: false, _id };
      const checkExist = await db.productCategory.findOne(filter);
      if (!checkExist) {
        return res.clientError({
          msg: responseMessages[1014],
        });
      }
      const status = checkExist.status === "active" ? "inactive" : "active";
      checkExist.status = status;
      await checkExist.save();
      return res.success({
        msg: `status updated ${status}`,
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
};
