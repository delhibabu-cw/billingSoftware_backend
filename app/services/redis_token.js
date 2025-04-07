const { REDIS_SERVER_NOT_CONNECTED } = require('../config/config');
const redisClient = require('./redis_service');
// const redisClient = asyncRedisClient
const jwtHelper = require('./jwt_helper');

const redisAndToken = async (user_id, device_id, ip, roleType, roleId) => {
  // const pinged = await redisClient.ping();
  // console.log('pinged', pinged);
  // if (!pinged || pinged !== 'PONG') {
  //   return REDIS_SERVER_NOT_CONNECTED;
  // }
  roleId = roleId.toString();
  const payload = { user_id, device_id, ip, roleType, roleId };
  console.log('payload---', payload);
  const accessToken = jwtHelper.signAccessToken(payload);
  console.log('accessToken---', accessToken);
  const refreshToken = jwtHelper.signRefreshToken(payload);
  console.log('Token generated with the parameters', payload);

  const tokens = {
    accessToken,
    refreshToken,
  };
  // const redisRespExists = await redisClient.exists(user_id);
  // if (redisRespExists) {
  //   const tokenRes = await redisClient.get(user_id);
  //   const decodedTokens = async () => {
  //     try {
  //       const data = await jwtHelper.verifyRefreshToken(tokenRes);
  //       return data;
  //     } catch (error) {
  //       console.log(error);
  //       await redisClient.del(user_id);
  //       return null;
  //     }
  //   };
  // }
  // await redisClient.set(user_id, refreshToken);
  return tokens;
};

const tokenExist = async () => {
  // let pinged = await redisClient.ping();
  // if (!pinged || pinged !== "PONG") {
  //     return REDIS_SERVER_NOT_CONNECTED;
  // }
  // const redisRespExists = await redisClient.exists(user_id);
  // if (redisRespExists) {
  //     const getToken = await redisClient.get(user_id);
  //     if (getToken == token) {
  //         return true
  //     }
  // }
  // return false;
};
const removeRefreshTokenRedis = async () => {
  // let pinged = await redisClient.ping();
  // if (!pinged || pinged !== "PONG") {
  //     return REDIS_SERVER_NOT_CONNECTED;
  // }
  // const redisRespExists = await redisClient.exists(user_id);
  // if (redisRespExists) {
  //     await redisClient.del(user_id);
  //     return true
  // }
  // return false;
};
const renewTokesAndRedis = async () => {
  // Payload user_id, device_id, ip, type, preference_id, schoolCode
  // let pinged = await redisClient.ping();
  // if (!pinged || pinged !== "PONG") {
  //     return REDIS_SERVER_NOT_CONNECTED;
  // }
  // console.log('renew access payload', payload);
  // const redisResp = await redisClient.get(payload.user_id);
  // if (redisResp) {
  //     const accessToken = jwtHelper.signAccessToken(payload);
  //     const refreshToken = jwtHelper.signRefreshToken(payload);
  //     await redisClient.set(payload.user_id, refreshToken);
  //     const data = { accessToken, refreshToken };
  //     return data;
  // }
  // return null;
};
const collectTokens = async (user_id, device_id, ip) => {
  const pinged = await redisClient.ping();
  if (!pinged || pinged !== 'PONG') {
    return REDIS_SERVER_NOT_CONNECTED;
  }

  const checkExists = await redisClient.exists(user_id);
  let foundDeviceTokens = [];
  if (checkExists) {
    const redisResp = await redisClient.get(user_id);
    const decodedTokensFunction = async () => {
      try {
        return await jwtHelper.verifyRefreshToken(redisResp);
      } catch (error) {
        console.log(error);
        await redisClient.del(user_id);
        return null;
      }
    };
    const decodedTokens = await decodedTokensFunction();
    // console.log('decodedTokens', decodedTokens);

    if (device_id) {
      foundDeviceTokens = decodedTokens && decodedTokens.device_id == device_id ? [decodedTokens] : [];
    }
    if (ip) {
      foundDeviceTokens = decodedTokens && decodedTokens.ip == ip ? [decodedTokens] : [];
    }
  }
  // console.log('foundDeviceTokens', foundDeviceTokens);
  return foundDeviceTokens;
};
module.exports = {
  redisAndToken,
  tokenExist,
  renewTokesAndRedis,
  removeRefreshTokenRedis,
  collectTokens,
};
