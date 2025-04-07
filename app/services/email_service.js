const {
  emailAuthUserName,
  emailAuthPassword,
  emailHost,
  emailPort
} = require('../config/config');

const { nodeMailer } = require('../services/imports');

async function sendEmail(email, subject, text) {
  const transporter = nodeMailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure:  false,
    auth: {
      user: emailAuthUserName,
      pass: emailAuthPassword
    }
  });

  const mailOptions = {
    from: emailAuthUserName,
    to: email,
    subject,
    text
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
        reject(error);
      }
      console.log('info------', info)
      resolve(true);
    })
  })
  // await transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(error);
  //   }
  //   console.log(`Email sent: ${info}`)
  //   return true;
  // });
}

module.exports = {
  sendEmail
}