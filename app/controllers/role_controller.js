const responseMessages = require('../middlewares/response-messages');
const { errorHandlerFunction } = require('../middlewares/error');
const db = require('../models');
const validator = require('../validators/role');
const RolesModel = db.role;

module.exports = {
  createRole: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateRoleCreate(req.body);
      if (error) {
        return res.clientError({
          msg: error
        })
      }
      const checkExists = await RolesModel.findOne({ name: req.body.name });
      if (checkExists) {
        return res.clientError({
          msg: responseMessages[1025]
        });
      }
      const data = await RolesModel.create(req.body);
      if (data && data._id) {
        return res.success({
          msg: responseMessages[1016],
          result: data
        });
      }
      return res.clientError({
        msg: responseMessages[1017],
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  getRole: async (req, res) => {
    try {
      const _id = req.params.id;
      const filter = { isDeleted: false };
      if (_id) {
        filter._id = _id;
        const data = await RolesModel.findOne(filter);
        if (data) {
          return res.success({
            msg: responseMessages[1018],
            result: data
          })
        }
        return res.clientError({
          msg: responseMessages[1014]
        })
      }
      const data = await RolesModel.find(filter);
      if (!data.length) {
        return res.success({
          msg: responseMessages[1014],
          result: data,
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
  updateRole: async (req, res) => {
    try {
      const { name } = req.body;
      const { error, validateData } = await validator.validateRoleUpdate(req.body);
      if (error) {
        return res.clientError({
          msg: error
        })
      }
      const _id = req.params.id;
      const checkExists = await RolesModel.findOne({ _id, isDeleted: false });
      if (!checkExists) {
        return res.clientError({
          msg: responseMessages[1014],
        });
      }
      const updData = {};
      if (req.body.name) updData.name = req.body.name;
      if (req.body.description) updData.description = req.body.description;
      const checkUnique = await RolesModel.findOne({ _id: { $ne: _id }, name, isDeleted: false });
      if (checkUnique) {
        return res.clientError({
          msg: `${name} this type of role is Already taken`,
        });
      }

      const data = await RolesModel.updateOne({ _id }, updData);
      if (data.modifiedCount) {
        return res.success({
          result: data,
          msg: responseMessages[1019],
        });
      }
      return res.clientError({
        msg: responseMessages[1020],
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  deleteRole: async (req, res) => {
    try {
      const _id = req.params.id;
      const checkExists = await RolesModel.findOne({ _id, isDeleted: false });
      if (!checkExists) {
        return res.clientError({
          msg: responseMessages[1014],
        });
      }
      const data = await RolesModel.updateOne({ _id }, { isDeleted: true });
      if (data.modifiedCount) {
        return res.success({
          msg: responseMessages[1021],
          result: data,
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
