const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

const create = Joi.object({
  fullName: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  dob: Joi.date().optional().allow('', null).error(commonService.getValidationMessage),
  mobile: Joi.string().required().error(commonService.getValidationMessage),
  subRole: Joi.string().required().error(commonService.getValidationMessage),
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
  validateCreateClientUser: async (dataToValidate) => validateFunc(create, dataToValidate),
};