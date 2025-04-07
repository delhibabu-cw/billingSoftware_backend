function randomNumber(len) {
  const result = Math.floor(Math.random() * 10 ** len);

  return (result.toString().length < len) ? random(len) : result;
}

function randomChar(len) {
  let text = '';

  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i++) { text += charset.charAt(Math.floor(Math.random() * charset.length)); }

  return text;
}

module.exports = {
  randomNumber,
  randomChar
};
