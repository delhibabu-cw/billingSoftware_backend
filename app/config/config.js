const envConfigs = {
    port: process.env.PORT,
    environment: process.env.NODE_ENV,
    DB_URL: process.env.DB_URL,
    redis_options: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD
    },
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME,
    REDIS_SERVER_NOT_CONNECTED: 'REDIS_SERVER_NOT_CONNECTED',
    smsApiKey: process.env.SMS_API_KEY,
    smsSenderId: process.env.SENDER_ID,
    awsBucketName: process.env.AWS_BUCKET_NAME,
    awsAccessKey: process.env.AWS_ACCESS_KEY,
    awsSecretKey: process.env.AWS_SECRET_KEY,
    awsRegion: process.env.AWS_BUCKET_REGION,
    emailAuthUserName: process.env.MAIL_AUTH_USERNAME,
    emailAuthPassword: process.env.MAIL_AUTH_PASSWORD,
    emailHost: process.env.MAIL_HOST,
    emailPort: process.env.MAIL_PORT,
    cloudinaryName: process.env.CLOUDINARY_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    roleNames: {
        superAd: 'SUPERADMIN',
        clientAd: 'CLIENTADMIN'
    }
};
console.log('database key------', process.env.DB_URL);
module.exports = { ...envConfigs }
