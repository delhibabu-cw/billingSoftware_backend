const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

const create = Joi.object({
  name: Joi.string().required().error(commonService.getValidationMessage),
  description: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const update = Joi.object({
  name: Joi.string().optional().error(commonService.getValidationMessage),
  description: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
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
  validateRoleCreate: async (dataToValidate) => validateFunc(create, dataToValidate),
  validateRoleUpdate: async (dataToValidate) => validateFunc(update, dataToValidate),
};
