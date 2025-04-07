const { axios } = require('./imports');

const authKey = process.env.OTP_AUTH_KEY;
const { smsApiKey, smsSenderId } = require('../config/config');

const sendOTP = async (mobile) => {
  const templateId = process.env.OTP_TEMPLATE_ID;
  const url = `https://api.msg91.com/api/v5/otp?invisible=1&authkey=${authKey}&mobile=${mobile}&template_id=${templateId}`;
  const resp = await axios.get(url);
  return resp;
};

const verifyOTP = async (mobile, otp) => {
  const url = `https://api.msg91.com/api/v5/otp/verify?mobile=${mobile}&otp=${otp}&authkey=${authKey}`;
  const resp = await axios.get(url);
  return resp;
};

const reSendOTP = async (mobile) => {
  const url = `https://api.msg91.com/api/v5/otp/retry?authkey=${authKey}&mobile=${mobile}&retrytype=text`;
  const resp = await axios.get(url);
  return resp;
};

const sendSMS = async (mobile, message) => {
  const url = `http://sms.aimwindow.in/vb/apikey.php?apikey=${smsApiKey}&senderid=${smsSenderId}&number=${mobile}&message=${message}`;
  // sample success
  // {"status":"Success","code":"011","description":"Message submitted successfully","data":{"messageid":"ODEwMDkzMw==","totnumber":4,"totalcredit":4}}
  // {"status":"false","code":"007","description":"No numbers found!"}
  const resp = await axios.get(url);
  console.log('response----', resp);
  return resp;
};

module.exports = {
  sendOTP,
  verifyOTP,
  reSendOTP,
  sendSMS,
};
