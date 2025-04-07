const responseMessages = require("../middlewares/response-messages");
const { errorHandlerFunction } = require("../middlewares/error");
const { paginationFn } = require("../utils/common_utils");
const { excel, bcrypt, mongoose } = require("../services/imports");
const validator = require("../validators/clientUsers");
const db = require("../models");

let skuCounter = 0;

function generateSKU(user) {
  console.log("user", user);
  const userCode = user.substring(0, 3).toUpperCase();
  skuCounter += 1;
  const skuNumber = skuCounter.toString().padStart(3, "0");
  const sku = `USER${userCode}${skuNumber}`;
  return sku;
}

module.exports = {
  createClientUsers: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateCreateClientUser(
        req.body
      );
      if (error) {
        return res.clientError({ msg: error });
      }

      // Check if user with the same mobile number exists
      const existingMobile = await db.clientUsers.findOne({
        mobile: req.body.mobile,
        isDeleted: false,
        clientId: req.decoded.user_id,
      });

      if (existingMobile) {
        return res.clientError({ msg: responseMessages[1009] });
      }

      // Fetch client details
      const client = await db.client.findOne({ _id: req.decoded.user_id });
      if (!client) {
        return res.clientError({ msg: "Client not found." });
      }

      req.body.clientId = client._id; // Assign ObjectId directly
      req.body.unquieId = generateSKU(req.body.fullName);

      // Create the user
      const data = await db.clientUsers.create(req.body);

      if (data && data._id) {
        // Increment userCount only if subRole exists
        // if (req.body.subRole) {
        //     const subRoleExists = await db.subRole.findById(req.body.subRole);
        //     if (subRoleExists) {
        //         await db.subRole.findByIdAndUpdate(req.body.subRole, { $inc: { userCount: 1 } });
        //     }
        // }
        await db.subRole.findByIdAndUpdate(req.body.subRole, {
          $inc: { userCount: 1 },
        });

        return res.success({ msg: responseMessages[1032], result: data });
      }

      return res.clientError({ msg: responseMessages[1017] });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  getClientUsers: async (req, res) => {
    try {
      const _id = req.params.id;
      // const filterQuery = { isDeleted: false };
      const filterQuery = _id
        ? { _id, isDeleted: false, clientId: req.decoded.user_id }
        : { isDeleted: false, clientId: req.decoded.user_id };
      const unwanted = {
        isDeleted: 0,
        // password: 0,
      };
      const populateValues = [
        { path: "subRole", select: "name" },
        {
          path: "clientId",
          select: "fullName clientId mobile role",
          populate: { path: "role", select: "name" },
        },
      ];
      if (_id) {
        const data = await db.clientUsers
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

      const { search, subRole , sortBy} = req.query;
      let sort = { createdAt: -1 };
      if (sortBy === "latest") sort = { createdAt: -1 };
      if (sortBy === "oldest") sort = { createdAt: 1 };

      // Dynamic filtering
      if (subRole) filterQuery.subRole = subRole;

      // Handle `search` input - look in multiple fields
      if (search) {
        const regex = new RegExp(search, "i"); // Case-insensitive search
        filterQuery.$or = [
          { fullName: regex },
          { mobile: regex },
          { unquieId: regex },
        ];
      }

      // Fetch all matching products without pagination
      let data = await db.clientUsers
        .find(filterQuery)
        .populate(populateValues)
        .select(unwanted)
        .sort(sort);

      console.log("arrayData", data);

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
  updateClientUser: async (req, res) => {
    try {
      const _id = req.params.id;
      const filterQuery = {
        isDeleted: false,
        _id,
        clientId: req.decoded.user_id,
      };
      const checkExist = await db.clientUsers.findOne(filterQuery);
      if (!checkExist) {
        return res.clientError({
          msg: responseMessages[1015],
        });
      }
      // const updateData = {};
      // Object.keys(req.body).forEach((key) => {
      //   updateData[key] = req.body[key];
      // });
      // const data = await db.user.updateOne(filterQuery, updateData)
      const data = await db.clientUsers.updateOne(filterQuery, req.body);
      if (data.modifiedCount) {
        return res.success({
          msg: responseMessages[1019],
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
  deleteClientUser: async (req, res) => {
    try {
      const _id = req.params.id;
      const filterQuery = {
        isDeleted: false,
        _id,
        clientId: req.decoded.user_id,
      };

      const checkExists = await db.clientUsers.findOne(filterQuery);
      if (!checkExists) {
        return res.clientError({
          msg: responseMessages[1015],
        });
      }

      console.log("checkExists", checkExists);

      // Perform soft delete
      const data = await db.clientUsers.updateOne(filterQuery, {
        isDeleted: true,
      });

      if (data.modifiedCount) {
        // Decrease userCount in subRole using checkExists.subRole
        if (checkExists.subRole) {
          await db.subRole.findByIdAndUpdate(checkExists.subRole, {
            $inc: { userCount: -1 },
          });
        }

        return res.success({
          msg: responseMessages[1035],
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
