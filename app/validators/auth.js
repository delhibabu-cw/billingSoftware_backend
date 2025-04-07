const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

const sendOtp = Joi.object({
  mobile: Joi.string().required().error(commonService.getValidationMessage)
}).error(commonService.getValidationMessage);

const verifyOtp = Joi.object({
  mobile: Joi.string().required().error(commonService.getValidationMessage),
  otp: Joi.string().required().error(commonService.getValidationMessage),
  device_id: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  fcm_token: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  ip: Joi.string().optional().allow('', null).error(commonService.getValidationMessage)
}).error(commonService.getValidationMessage);

const signin = Joi.object({
  userName: Joi.string().required().error(commonService.getValidationMessage),
  password: Joi.string().required().error(commonService.getValidationMessage),
  role: Joi.string().required().error(commonService.getValidationMessage),
  device_id: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  fcm_token: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
  ip: Joi.string().optional().allow('', null).error(commonService.getValidationMessage)
}).error(commonService.getValidationMessage);

const signup = Joi.object({
  user_id: Joi.string().required().error(commonService.getValidationMessage),
  mobile: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string().required().error(commonService.getValidationMessage),
  name: Joi.string().required().error(commonService.getValidationMessage),
  password: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const signupForm = Joi.object({
  firstName: Joi.string().required().error(commonService.getValidationMessage),
  lastName: Joi.string().optional().error(commonService.getValidationMessage),
  email: Joi.string().optional().error(commonService.getValidationMessage),
  mobile: Joi.string().optional().error(commonService.getValidationMessage),
  password: Joi.string().required().error(commonService.getValidationMessage),
  confirmPassword: Joi.string().required().error(commonService.getValidationMessage)
}).error(commonService.getValidationMessage);

// const forgotPassword = Joi.object({
//   value: Joi.string().required().error(commonService.getValidationMessage),
//   otp: Joi.string().optional().error(commonService.getValidationMessage)
// }).error(commonService.getValidationMessage);

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
  validateOtpSent: async (dataToValidate) => validateFunc(sendOtp, dataToValidate),
  validateOtpVerify: async (dataToValidate) => validateFunc(verifyOtp, dataToValidate),
  validateSignin: async (dataToValidate) => validateFunc(signin, dataToValidate),
  validateSignup: async (dataToValidate) => validateFunc(signup, dataToValidate),
  validateSignUpFrom: async (dataToValidate) => validateFunc(signupForm, dataToValidate)
};
