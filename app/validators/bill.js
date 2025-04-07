const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

// Product Validation Schema
const productSchema = Joi.object({
  productId: Joi.string().required().error(commonService.getValidationMessage),
  name: Joi.string().required().error(commonService.getValidationMessage),
  price: Joi.number().required().error(commonService.getValidationMessage),
  gstAmount: Joi.number().optional().allow(0).error(commonService.getValidationMessage),
  total: Joi.number().required().error(commonService.getValidationMessage),
  quantity: Joi.number().required().error(commonService.getValidationMessage),
  productAddedFromStock: Joi.string().required().error(commonService.getValidationMessage),
  actualPrice: Joi.number().required().error(commonService.getValidationMessage),
  profitMargin: Joi.number().required().error(commonService.getValidationMessage),
});

// Main Create Bill Schema
const create = Joi.object({
  billNo: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),

  customer: Joi.object({
    name: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
    mobile: Joi.string().optional().allow('', null).error(commonService.getValidationMessage)
       }).optional().allow(null),

  employee: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),

  selectedProducts: Joi.array()
    .items(productSchema)
    .min(1)
    .required()
    .error(commonService.getValidationMessage),

  totalAmount: Joi.number().required().error(commonService.getValidationMessage),
});

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
  validateCreateBill: async (dataToValidate) => validateFunc(create, dataToValidate),
};
