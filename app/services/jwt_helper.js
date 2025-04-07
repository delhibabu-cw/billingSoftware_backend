const { jwt } = require('./imports');
const { accessTokenExpiresIn, refreshTokenExpiresIn } = require('../config/config');

const signAccessToken = (payload) => {
  // let privateKey = fs.readFileSync(path.join(__dirname, "certificates/privateAccessKey.pem"), 'utf8');
  const privateKey = 'SECRET_KEY_RDM';
  return jwt.sign(payload, privateKey, { algorithm: 'HS256', expiresIn: accessTokenExpiresIn });
};

const signRefreshToken = (payload) => {
  // let privateKey = fs.readFileSync(path.resolve(__dirname, "certificates/privateRefreshKey.pem"), 'utf8');
  const privateKey = 'SECRET_KEY_RDM';
  return jwt.sign(payload, privateKey, { algorithm: 'HS256', expiresIn: refreshTokenExpiresIn });
};
const verifyAccessToken = (token) => {
  // let privateKey = fs.readFileSync(path.resolve(__dirname, "certificates/privateAccessKey.pem"), 'utf8');
  console.log('verify access token-------', token);
  const privateKey = 'SECRET_KEY_RDM';
  return jwt.verify(token, privateKey);
};
const verifyRefreshToken = (token) => {
  // let privateKey = fs.readFileSync(path.resolve(__dirname, "certificates/privateRefreshKey.pem"), 'utf8');
  const privateKey = 'SECRET_KEY_RDM';
  return jwt.verify(token, privateKey);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
