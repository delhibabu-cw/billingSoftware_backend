const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

const create = Joi.object({
  fullName: Joi.string().required().error(commonService.getValidationMessage),
  userName: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string().required().error(commonService.getValidationMessage),
  mobile: Joi.string().required().error(commonService.getValidationMessage),
  role: Joi.string().required().error(commonService.getValidationMessage),
  password: Joi.string().required().error(commonService.getValidationMessage),
  category: Joi.string().required().error(commonService.getValidationMessage),
  // gst: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  // skills: Joi.array().items(Joi.string()).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

async function validateFunc(schemaName, dataToValidate) {
  try {
    const { error, value } = schemaName.validate(dataToValidate);
    return {
      error: error ? commonService.convertJoiErrors(error.details) : '',
      validatedData: value,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

module.exports = {
  validateCreateClient: async (dataToValidate) => validateFunc(create, dataToValidate),
};