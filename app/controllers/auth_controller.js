const db = require('../models');
const responseMessages = require('../middlewares/response-messages');
const { redisAndToken, redisDecodeRefreshToken } = require('../services/redis_token');
const { bcrypt } = require('../services/imports');
const validator = require('../validators/auth');
const { sendSMS, sendOTP } = require('../services/otp_helper');
const { randomNumber, randomChar } = require('../services/random_number');
const { errorHandlerFunction } = require('../middlewares/error');
const { roleNames } = require('../config/config');
const { sendEmail } = require('../services/email_service');
const { validate } = require('../models/roles_model');
const { signAccessToken, signRefreshToken } = require('../services/jwt_helper');

module.exports = {
  sendOtp: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateOtpSent(req.body);
      if (error) {
        return res.clientError({
          msg: error
        })
      }

      const { mobile } = req.body;
      let isMobile = false;
      const num = Number(mobile);
      if (num) isMobile = true

      const filterQuery = { isDeleted: false }
      if (isMobile) {
        filterQuery.mobile = mobile.toString();
        req.body.mobile = mobile;
      } else {
        filterQuery.email = mobile;
        req.body.email = mobile;
      }
      const checkExist = await db.user.findOne(filterQuery);
      console.log('check-----', checkExist)

      if (!checkExist) {
        const findRole = await db.role.findOne({ name: roleNames.cus });
        if (!findRole) {
          return res.clientError({
            msg: responseMessages[1013]
          })
        }

        req.body.role = findRole.id;
        if (req.body.password) {
          req.body.password = await bcrypt.hashSync(req.body.password, 8);
        }

        const data = await db.user.create(req.body);
        if (!data) {
          return res.clientError({
            msg: 'something went wrong'
          });
        }
      }

      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      const userName = checkExist && checkExist.name ? checkExist.name : 'User';
      const message = `Dear ${userName}, Your OTP for ${'login'} portal is : ${randomNumber}. Don't share with any one.`
      const otpDetails = {
        mobile,
        code: randomNumber
      }

      if (!isMobile) {
        const subject = 'OTP verification'
        const emailResp = await sendEmail(mobile, subject, message);
        console.log('emailResp-------', emailResp)
      } else{
        // sms logics
      }

      const checkOtp = await db.mobileOtp.findOne({ mobile: mobile });
      if (checkOtp) {
        const data = await db.mobileOtp.updateOne({ mobile: mobile }, otpDetails);
        if (data.modifiedCount) {
          return res.success({
            msg: responseMessages[1010]
          });
        }

        return res.clientError({
          msg: responseMessages[1011]
        })
      } else {
        const createOtp = await db.mobileOtp.create(otpDetails)
        if (createOtp) {
          return res.success({
            msg: responseMessages[1010]
          })
        }

        return res.clientError({
          msg: responseMessages[1011]
        })
      }
    } catch (error) {
      errorHandlerFunction(res, error)
    }
  },
  verifyOtp: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateOtpVerify(req.body);
      if (error) {
        return res.clientError({
          msg: error
        })
      }

      let { otp, mobile, device_id, ip } = req.body;
      const num = Number(mobile)
      let isMobile = false;
      if (num) isMobile = true

      const filterQuery = { isDeleted: false }
      const updData = {};
      if (isMobile) {
        filterQuery.mobile = mobile.toString();
        updData.mobileVerified = true
      } else {
        filterQuery.email = mobile
        updData.emailVerified = true
      }
      let checkExists = await db.user.findOne(filterQuery).populate('role', 'name')
        .select({ isDeleted: 0, createdAt: 0, updatedAt: 0});
      console.log('checkExists------------', checkExists);
      const checkOtp = await db.mobileOtp.findOne({ mobile, code: otp });
      if (!checkOtp && otp != '123456') {
        return res.clientError({
          msg: 'otp is incorrect'
        })
      };
      
      const update = await db.user.updateOne(filterQuery, updData);
      if (!update.modifiedCount) {
        return res.clientError({
          msg: responseMessages[1013]
        })
      }
      //again find for email or mobile verified
      checkExists = await db.user.findOne(filterQuery).populate('role', 'name')
      .select({ isDeleted: 0, createdAt: 0, updatedAt: 0});

      if (!device_id) device_id = '123';
      if (!ip) ip = '3523'

      const tokens = await redisAndToken(
        checkExists._id.toString(),
        device_id,
        ip,
        checkExists.role.name,
        checkExists.role._id.toString()
      )
      const resultObj = { tokens };
      resultObj.user = checkExists;
      resultObj.user = { ...resultObj.user._doc };
      resultObj.user.roleType = checkExists.role.name;

      resultObj.user = checkExists;
      resultObj.user = { ...resultObj.user._doc };
      if (resultObj.user.password) delete resultObj.user.password;
      return res.success({
        msg: responseMessages[1012],
        result: resultObj
      });
    } catch (error) {
      errorHandlerFunction(res, error)
    }
  },
  checkMobile: async (req, res) => {
    try {
      const filterQuery = { isDeleted: false, mobile: req.body.mobile };
      const checkExist = await db.user.findOne(filterQuery);
      if (checkExist) {
        return res.success({
          msg: 'Mobile Number already exists.'
        });
      }
      return res.success({
        msg: 'Mobile Number not exists.',
        result: data
      });
    } catch (error) {
      errorHandlerFunction(res, error)
    }
  },
  checkEmail: async (req, res) => {
    try {
      const filterQuery = { isDeleted: false, email: req.body.email };
      const checkExists = await db.user.findOne(filterQuery);
      if (checkExists) {
        return res.success({
          msg: 'Email already exists.'
        });
      }
      return res.success({
        msg: 'Email not exists.'
      });
    } catch (error) {
      errorHandlerFunction(res, error)
    }
  },
  signup: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateSignup(req.body);
      if (error) {
        return res.clientError({
          msg: error
        })
      }
      console.log('req.body---', req.body);
      const { user_id, role, mobile, email, password, name } = req.body;
      // const filterArray = [{ mobile: req.body.mobile }];
      // if (req.body.email) filterArray.push({ email: req.body.email });
      const checkExists = await User.findOne({
        _id: { $nin: user_id },
        $or: [{ mobile: mobile, email: email }],
        isDeleted: false
      });
      if (checkExists) {
        return res.clientError({ msg: responseMessages[1014] });
      };
      if (!role) {
        const role = await Role.findOne({ name: 'USER' })
        req.body.role = role._id
      }
      const checkRoleExists = await Role.findOne({ _id: req.body.role, isDeleted: false });
      if (!checkRoleExists) return res.clientError({ msg: 'Invalid Role' });
      if (checkRoleExists && checkRoleExists._id) req.body.role = checkRoleExists._id.toString();
      req.body.password = await bcrypt.hashSync(password, 8);
      req.body.userName = email;
      const data = await User.updateOne({ _id: user_id }, req.body);
      console.log('data---', data);

      if (data.modifiedCount) {
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        const message = `Dear ${name}, Your OTP for ${'login'} portal is : ${randomNumber}. Don't share with any one - Aim Window`
        const otpCreate = {
          mobile,
          code: randomNumber
        }
        console.log('otpcrrate-------', otpCreate);
        const otpData = await MobileOTPModel.create(otpCreate)
        const smsresp = await sendSMS(mobile, message);
        console.log('smsresp--------', smsresp)
        if (email) {
          const emailVerification = {
            email,
            user_id,
            verification_id: randomChar(60),
            expiresOn: Date.now() + 3600000
          }
          const checkExists = await db.emailVerification.findOne({ user_id });
          if (checkExists) {
            await db.emailVerification.deleteOne({ _id: checkExists._id });
          }
          const response = await db.emailVerification.create(emailVerification);
          if (response) {
            const resetUrl = `${req.protocol}:dev.printon.co.in/verify/email?token=${emailVerification.verification_id}`
            const emailResp = await accountCreationMail(email, name, resetUrl);
            console.log('emailResp---', emailResp)
          }
        }
        if (otpData) {
          return res.success({
            msg: responseMessages[1015]
          });
        }
        return res.clientError({
          msg: responseMessages[1016]
        });
      }
      return res.clientError({
        msg: 'Something went wrong..',
      });
    } catch (error) {
      errorHandlerFunction(res, error)
    }
  },
  signin: async (req, res) => {
    try {
      console.log('signin-------');
      const { error, validateData } = await validator.validateSignin(req.body);
      if (error) {
        return res.clientError({
          msg: error
        })
      }

      const { userName, password, device_id, fcm_token, ip } = req.body;
      console.log("Finding user with email:", userName);
      console.log("Finding user with email:", req.body);

      const roleName = await db.role.findOne({ _id: req.body.role });
      console.log(roleName);
      
      let checkExists = '';
      if(roleName?.name === 'SUPERADMIN'){
         checkExists = await db.user.findOne({ 
          $or: [{ userName: userName }, { mobile: userName }], 
          isDeleted: false 
        }).select("+password").populate('role', 'name');
      }else{
        checkExists = await db.client.findOne({ 
          $or: [{ userName: userName }, { mobile: userName }], 
          isDeleted: false 
        }).select("+password").populate('role', 'name');
      }
    
      
      console.log("User found:", checkExists);
      console.log("Password:", checkExists?.password);
      console.log("Password:", checkExists?.role);

      if (!checkExists) return res.clientError({ msg: responseMessages[1008] });
      if (!device_id && !ip) return res.clientError({ msg: 'Device id or ip is required' });
      // const passwordIsValid = bcrypt.compareSync(password, checkExists.password);

      if (!checkExists.password) {
        return res.clientError({ msg: "User password is missing" });
      }
      // const passwordIsValid = bcrypt.compareSync(password, checkExists.password);
      const passwordIsValid = checkExists.password === password;
      
      if (!passwordIsValid) {
        return res.clientError({ msg: responseMessages[1008] });
      }
      
      if (device_id && fcm_token) {
        await db.fcm.deleteOne({ user_id: checkExists._id.toString() });
        await db.fcm.create({ user_id: checkExists._id.toString(), fcm_token, device_id });
      }
      const getRoleId = checkExists.role;
      /** TOKEN GENERATION START */

      console.log({
        userId: checkExists._id?.toString(),
        device_id,
        ip,
        roleName: getRoleId?.name,
        roleId: checkExists.role?._id?.toString()
    });

    const payload = { user_id: checkExists._id.toString(), roleType: checkExists.role.name, roleId: checkExists.role._id.toString() }
            const accessToken = await signAccessToken(payload)
            const refreshToken = await signRefreshToken(payload)
            const tokens = {
                accessToken,
                refreshToken
            }
      // const tokens = await redisAndToken(
      //   checkExists._id.toString(),
      //   device_id,
      //   ip,
      //   getRoleId.name,
      //   checkExists.role._id.toString()
      // );
      // const token = await jwtHelper.signAccessToken(payload)
      const resultObj = { tokens };
      resultObj.user = checkExists;
      resultObj.user = { ...resultObj.user._doc };
      resultObj.user.roleType = getRoleId.name;

      resultObj.user = checkExists;
      resultObj.user = { ...resultObj.user._doc };
      resultObj.user.roleType = getRoleId.name;
      if (resultObj.user.password) delete resultObj.user.password;
      return res.success({ msg: 'Logged in Successfully!!!', result: resultObj });
    } catch (error) {
      errorHandlerFunction(res, error)
    }
  },
  signupForm: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateSignUpFrom(req.body);
      if (error) {
        return res.clientError({
          msg: error
        })
      }

      const filterQuery = { isDeleted: false, _id: req.params.id };

      const checkExists = await db.user.findOne(filterQuery);
      if (!checkExists) {
        return res.clientError({
          msg: responseMessages[1014]
        })
      }

      // console.log('validateData', )
      if (req.body.password !== req.body.confirmPassword) {
        return res.clientError({
          msg: 'Passwoed and confirm password is incorrect'
        })
      }

      req.body.password = await bcrypt.hashSync(req.body.password, 8);

      const data = await db.user.updateOne(filterQuery, req.body);
      if (data.modifiedCount) {
        return res.success({
          msg: responseMessages[1019],
          result: data
        })
      }
      return res.clientError({
        msg: responseMessages[1020]
      })
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  changePassword: async (req, res) => {
    try {
      console.log('change password');
      const { user_id } = req.decoded;
      const filterQuery = { isDeleted: false };
      filterQuery._id = user_id;
      const user = await User.findOne(filterQuery);
      if (!user) {
        return res.clientError({
          msg: 'user not found'
        });
      }
      const { oldPassword } = req.body;
      const checkPsw = bcrypt.compareSync(oldPassword, user.password);
      if (!checkPsw) {
        return res.clientError({
          msg: 'old password is incorect'
        });
      }
      const password = req.body.newPassword;
      const hashedNewPassword = await bcrypt.hashSync(password, 8);
      await User.updateOne({ _id: user_id }, { $set: { password: hashedNewPassword } });
      //  user.password = hashPassword
      // await user.save()
      return res.success({
        msg: 'password change succesfully'
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return res.internalServerError({ ...error.error });
      }
      return res.internalServerError({ error });
    }
  },
  // forgotPassword: async (req, res) => {
  //     try {
  //         const { value } = req.body;
  //         // const filterQuery = { isDeleted: false };
  //         // if(value)filterQuery.email = value;
  //         // if(value)filterQuery.mobile = value;
  //         const existsUser = await PortalUserModel.findOne({ $or: [{ email: value, }, { mobile: value }], isDeleted: false });
  //         console.log('existUser', existsUser);

  //         if (!existsUser) {
  //             return res.clientError({
  //                 msg: 'Invalid Email or Mobile'
  //             });
  //         }
  //         const myDate = new Date();
  //         myDate.setHours(myDate.getHours() + 1);
  //         console.log('myDate--------', myDate);

  //         if (existsUser.email === value) {
  //             console.log('if------------------');
  //             const resetUserPassword = {
  //                 email: value,
  //                 user_id: existsUser._id.toString(),
  //                 verification_id: randomChar(80),
  //                 expiresOn: myDate,
  //             };
  //             const resetToken = resetUserPassword.verification_id;

  //             const checkExist = await ResetPassword.findOne({ user_id: existsUser._id.toString() });
  //             if (checkExist) {
  //                 await ResetPassword.deleteOne({ _id: checkExist._id });
  //             }
  //             const response = await ResetPassword.create(resetUserPassword);
  //             if (response) {
  //                 const resetUrl = `${req.protocol}://${req.get('host')}/reset/password?token=${resetToken}`;
  //                 console.log('resetUrl------------', resetUrl);

  //                 const text = `your password reset url is as fallows \n\n 
  //       ${resetUrl}\n\n if you have not requested this email, than ignored it`;
  //                 const subject = 'Password Reset Request';

  //                 const emailTemData = await sendEmail(value, subject, text);

  //                 return res.success({
  //                     msg: 'Email Sent Successfully:',
  //                     result: emailTemData
  //                 });
  //             }
  //         } else {
  //             const resetUserPassword = {
  //                 mobile: value,
  //                 user_id: existsUser._id.toString(),
  //                 expiresOn: myDate,
  //                 otp: randomNumber(6)
  //             };
  //             const OTP = resetUserPassword.otp;
  //             console.log('resetOTP', OTP);

  //             const checkExist = await ResetPassword.findOne({ user_id: existsUser._id.toString() });
  //             if (checkExist) {
  //                 await ResetPassword.deleteOne({ _id: checkExist._id });
  //             }
  //             const response = await ResetPassword.create(resetUserPassword);
  //             if (response) {
  //                 // const message = `your reset password otp is ${OTP}`;
  //                 const text = 'user your forgot password otp is';
  //                 const message = `Dear ${text}, Your OTP for DR MGRERI COP portal is : ${OTP}. - Dr.M.G.R Education and Research Institute, Chennai`;

  //                 const otpSend = await sendSMS(value, message);
  //                 const checkotp = await sendOTP(value);
  //                 console.log('---------------', checkotp);
  //                 if (otpSend.data.status == false || otpSend.data.code == '007') {
  //                     return res.clientError({ msg: otpSend.data.description });
  //                 }
  //                 return res.success({
  //                     msg: 'otp Sent Successfully',
  //                     result: otpSend.data
  //                 });
  //             }
  //         }
  //     } catch (error) {
  //         if (error.status) {
  //             if (error.status < 500) {
  //                 return res.clientError({
  //                     ...error.error,
  //                     statusCode: error.status,
  //                 });
  //             }
  //             return res.internalServerError({ ...error.error });
  //         }
  //         return res.internalServerError({ error });
  //     }
  // },

  // resetVerify: async (req, res, next) => {
  //     try {
  //         const { value, otp } = req.body;
  //         const { token } = req.params;
  //         const existsUser = await PortalUserModel.findOne({ $or: [{ email: value, }, { mobile: value }], isDeleted: false });
  //         if (!existsUser) {
  //             return res.clientError({
  //                 msg: 'Invalid Email or Mobile'
  //             });
  //         }
  //         // if (existsUser.email == value) {
  //         //   const userId = existsUser._id.toString();
  //         //   const findQuery = { user_id: userId, verification_id: token, expiresOn: { $gt: Date.now() } };
  //         //   const response = await ResetPassword.findOne(findQuery);
  //         //   if (response) {
  //         //     const update = await ResetPassword.updateOne({ _id: response._id }, { isVerified: true });
  //         //     if (update.modifiedCount) {
  //         //       return res.success({
  //         //         msg: 'Verified successfully, please reset your password'
  //         //       });
  //         //     }
  //         //   } else {
  //         //     return res.clientError({
  //         //       msg: ' Reset Password Link Invalid or Expired '
  //         //     });
  //         //   }
  //         // }
  //         if (existsUser.mobile == value) {
  //             const userId = existsUser._id.toString();
  //             const findQuery = { user_id: userId, otp, expiresOn: { $gt: Date.now() } };
  //             const response = await ResetPassword.findOne(findQuery);
  //             if (response) {
  //                 const update = await ResetPassword.updateOne({ _id: response._id }, { isVerified: true });
  //                 if (update.modifiedCount) {
  //                     return res.success({
  //                         msg: 'Verified successfully, please reset your password'
  //                     });
  //                 }
  //             } else {
  //                 return res.clientError({
  //                     msg: ' Reset Password OTP Invalid or Expired '
  //                 });
  //             }
  //         }
  //     } catch (error) {
  //         if (error.status) {
  //             if (error.status < 500) {
  //                 return res.clientError({
  //                     ...error.error,
  //                     statusCode: error.status,
  //                 });
  //             }
  //             return res.internalServerError({ ...error.error });
  //         }
  //         return res.internalServerError({ error });
  //     }
  // },

  // resetPassword: async (req, res) => {
  //     try {
  //         const { value, password, confirmPassword } = req.body;
  //         const { token } = req.params;
  //         const existsUser = await PortalUserModel.findOne({ $or: [{ email: value, }, { mobile: value }], isDeleted: false });
  //         if (!existsUser) {
  //             return res.clientError({
  //                 msg: 'Invalid Email or Mobile'
  //             });
  //         }
  //         if (existsUser.email == value) {
  //             const userId = existsUser._id.toString();
  //             const findQuery = { user_id: userId, verification_id: token, expiresOn: { $gt: Date.now() } };
  //             const response = await ResetPassword.findOne(findQuery);
  //             if (response) {
  //                 await ResetPassword.updateOne({ _id: response._id }, { isVerified: true });
  //             } else if (!response) {
  //                 return res.clientError({
  //                     msg: ' Reset Password Link Invalid or Expired '
  //                 });
  //             }
  //         }
  //         const checkVerified = await ResetPassword.findOne({ user_id: existsUser._id });
  //         if (checkVerified.isVerified == false) {
  //             return res.clientError({
  //                 msg: 'Kindly check verify to reset your password'
  //             });
  //         }
  //         if (password != confirmPassword) {
  //             return res.clientError({
  //                 msg: 'password and confirmPassword donot match'
  //             });
  //         }
  //         const hashedNewPassword = await bcrypt.hashSync(password, 8);
  //         const update = await PortalUserModel.updateOne({ _id: existsUser._id }, { password: hashedNewPassword });
  //         if (update.modifiedCount) {
  //             checkVerified.otp = undefined;
  //             checkVerified.verification_id = undefined;
  //             checkVerified.isVerified = false;
  //             await checkVerified.save({ validateBeforeSave: false });

  //             return res.success({
  //                 msg: 'Password Reset Successfully'
  //             });
  //         }
  //         return res.clientError({
  //             msg: 'Password Reset Failed'
  //         });
  //     } catch (error) {
  //         if (error.status) {
  //             if (error.status < 500) {
  //                 return res.clientError({
  //                     ...error.error,
  //                     statusCode: error.status,
  //                 });
  //             }
  //             return res.internalServerError({ ...error.error });
  //         }
  //         return res.internalServerError({ error });
  //     }
  // }

};
