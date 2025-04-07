const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

const create = Joi.object({
  name: Joi.string().required().error(commonService.getValidationMessage),
  category: Joi.string().required().error(commonService.getValidationMessage),
  description: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  img_url: Joi.string().required().error(commonService.getValidationMessage),
  price: Joi.string().required().error(commonService.getValidationMessage),
// isgst should be a boolean (true/false)
isgst: Joi.boolean().required().error(commonService.getValidationMessage),

// gstAmount should be required if isgst is true, else optional
gstAmount: Joi.when('isgst', {
  is: true,
  then: Joi.string().required().error(commonService.getValidationMessage),
  otherwise: Joi.string().optional().allow('',null).error(commonService.getValidationMessage)
}),
}).error(commonService.getValidationMessage);

const update = create.append({
  name: Joi.string().optional().error(commonService.getValidationMessage),
  catogory: Joi.string().optional().error(commonService.getValidationMessage),
  minimum_price: Joi.number().strict().min(0).optional().error(commonService.getValidationMessage),
  brand: Joi.string().optional().error(commonService.getValidationMessage)
}).error(commonService.getValidationMessage)

const get = Joi.object({
  perPage: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  currentPage: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  search: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  category: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage)

const deleteProduct = Joi.object({
  product_name: Joi.string().required().error(commonService.getValidationMessage)
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
  validateCreateProduct: async (dataToValidate) => validateFunc(create, dataToValidate),
  validateUpdateProduct: async (dataToValidate) => validateFunc(update, dataToValidate),
  validateGetProduct: async (dataToValidate) => validateFunc(get, dataToValidate),
  validateDeleteProduct: async (dataToValidate) => validateFunc(deleteProduct, dataToValidate)
};
