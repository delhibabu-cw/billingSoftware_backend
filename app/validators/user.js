const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

const create = Joi.object({
  fullName: Joi.string().required().error(commonService.getValidationMessage),
  userName: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string().required().error(commonService.getValidationMessage),
  mobile: Joi.string().required().error(commonService.getValidationMessage),
  role: Joi.string().required().error(commonService.getValidationMessage),
  password: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  // skills: Joi.array().items(Joi.string()).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const update = Joi.object({
  email: Joi.string().optional().error(commonService.getValidationMessage),
  ownerName: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  role: Joi.string().optional().error(commonService.getValidationMessage),
  mobile: Joi.string().optional().error(commonService.getValidationMessage),
  name: Joi.string().optional().error(commonService.getValidationMessage),
  alternativeMobileNumber: Joi.string().optional().error(commonService.getValidationMessage),
  areaName: Joi.string().optional().error(commonService.getValidationMessage),
  pin_code: Joi.string().optional().error(commonService.getValidationMessage),
  status: Joi.string().optional().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const profileUpdate = Joi.object({
  name: Joi.string().optional().error(commonService.getValidationMessage),
  email: Joi.string().optional().error(commonService.getValidationMessage),
  address: Joi.string().optional().error(commonService.getValidationMessage),
  mobile: Joi.string().optional().error(commonService.getValidationMessage)
}).error(commonService.getValidationMessage)

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
  validateCreateUser: async (dataToValidate) => validateFunc(create, dataToValidate),
  validateUserUpdate: async (dataToValidate) => validateFunc(update, dataToValidate),
  validateUpdateProfile: async (dataToValidate) => validateFunc(profileUpdate, dataToValidate)
};
