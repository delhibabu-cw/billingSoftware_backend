const responseMessages = require('../middlewares/response-messages');
const { errorHandlerFunction } = require('../middlewares/error');
const { paginationFn } = require('../utils/common_utils');
const { excel, bcrypt } = require('../services/imports');
const validator = require('../validators/user');
const db = require('../models');

module.exports = {
  createUser: async (req, res) => {
    try {
      const { error, validateData } = await validator.validateCreateUser(req.body);
      if (error) {
        return res.clientError({
          msg: error
        })
      }
      const filterQuery = { isDeleted: false };
      filterQuery.mobile = req.body.mobile;
      const checkExist = await db.user.findOne(filterQuery);
      if (checkExist) {
        return res.clientError({
          msg: responseMessages[1009]
        })
      }
      req.body.password = await bcrypt.hashSync(req.body.password, 8);
      // req.body.userName = req.body.email;
      const data = await db.user.create(req.body);
      if (data && data._id) {
        return res.success({
          msg: responseMessages[1026],
          result: data
        });
      }
      return res.clientError({
        msg: responseMessages[1017]
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  // getUser: async (req, res) => {
  //   try {
  //     const _id = req.params.id;
  //     const filterQuery = _id ? { _id, isDeleted: false } : { isDeleted: false };
  //     // const unwanted = { isDeleted: 0, password: 0 };
  
  //     if (_id) {
  //       const data = await db.user.findOne(filterQuery);
  //       if (data) {
  //         return res.success({ msg: responseMessages[1018], result: data });
  //       }
  //       return res.clientError({ msg: responseMessages[1015] });
  //     }
  
  //     const { perPage, currentPage, sortBy } = req.query;
  //     let sort = { createdAt: -1 };
  //     if (sortBy === 'latest') sort = { createdAt: -1 };
  //     if (sortBy === 'oldest') sort = { createdAt: 1 };
  
  //     const result = await paginationFn(res, db.user, filterQuery, perPage, currentPage, '', sort, '');
  //     if (!result || !result.rows) {
  //       return res.success({ msg: responseMessages[1014], result: { rows: [] } });
  //     }
  
  //     return res.success({ msg: responseMessages[1018], result });
  //   } catch (error) {
  //     return errorHandlerFunction(res, error);
  //   }
  // },  
  getUser: async (req, res) => {
    try {
      const _id = req.params.id;
      // const filterQuery = { isDeleted: false };
      const filterQuery = _id ? { _id, isDeleted: false } : { isDeleted: false };
      const unwanted = {
        isDeleted: 0,
        // password: 0,
      }
      const populateValues = { path: 'role', select: 'name' };
      if (_id) {
        const data = await db.user.findOne(filterQuery).select(unwanted).populate(populateValues);
        if (data) {
          return res.success({
            msg: responseMessages[1018],
            result: data
          });
        }
        return res.clientError({
          msg: responseMessages[1015]
        })
      }
      const { perPage, currentPage, sortBy, role } = req.query;
      let sort = { createdAt: -1 };
      if (sortBy === 'latest') sort = { createdAt: -1 };
      if (sortBy === 'oldest') sort = { createdAt: 1 };
      // if(collegeName){
      //   const rex = new RegExp(collegeName, `i`)
      //   filterQuery.collegeName = rex
      // }
      if(role){
        filterQuery.role = role
      }
      const { rows, pagination } = await paginationFn(
        res,
        db.user,
        filterQuery,
        perPage,
        currentPage,
        populateValues,
        sort,
        unwanted
      )
      if (!rows.length) {
        return res.success({
          msg: responseMessages[1014],
          result: { rows }
        });
      }
      return res.success({
        msg: responseMessages[1018],
        result: { rows, pagination }
      })
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  updateUser: async (req, res) => {
    try {
      const _id = req.params.id;
      const filterQuery = { isDeleted: false, _id };
      const checkExist = await db.user.findOne(filterQuery);
      if (!checkExist) {
        return res.clientError({
          msg: responseMessages[1015]
        })
      }
      // const updateData = {};
      // Object.keys(req.body).forEach((key) => {
      //   updateData[key] = req.body[key];
      // });
      // const data = await db.user.updateOne(filterQuery, updateData)
      const data = await db.user.updateOne(filterQuery, req.body)
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
  deleteUser: async (req, res) => {
    try {
      const _id = req.params.id;
      const filterQuery = { isDeleted: false, _id };
      const checkExists = await db.user.findOne(filterQuery);
      if (!checkExists) {
        return res.clientError({
          msg: responseMessages[1015]
        })
      }
      const data = await db.user.updateOne(filterQuery, { isDeleted: true });
      if (data.modifiedCount) {
        return res.success({
          msg: responseMessages[1028],
          result: data
        });
      }
      return res.clientError({
        msg: responseMessages[1022]
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  getProfile: async (req, res) => {
    try {
      const _id = req.decoded.user_id;
      const filterQuery = { isDeleted: false, _id };
      const unnessary = {
        password: 0,
        provider: 0,
        mobileVerified: 0,
        emailVerified: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0
      }

        console.log(req.decoded);
        const roleName = await db.role.findOne({ _id: req.decoded.roleId });
            console.log(roleName);

            let data = '';
            if(roleName?.name === 'SUPERADMIN'){
               data = await db.user.findOne(filterQuery).populate('role', 'name').select(unnessary);
            }else{
              data = await db.client.findOne(filterQuery).populate('role', 'name').select(unnessary);
            }
      
      //  data = await db.user.findOne(filterQuery).populate('role', 'name').select(unnessary);
      if (!data) {
        return res.clientError({
          msg: responseMessages[1015]
        })
      }
      return res.success({
        msg: 'Profile details fetched',
        result: data
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  getUserExcelData: async (req, res) => {
    try{
      const data = await db.user.find({ isDeleted: false })
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('Data');
      worksheet.columns = [
        { header: 'Full Name', key: 'fullName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Whatsapp Number', key: 'mobile', width: 20 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'College Name', key: 'collegeName', width: 20 },
        { header: 'Degree', key: 'degree', width: 15 },
        { header: 'Skills', key: 'skills', width: 30 },
        { header: 'Date', key: 'createdAt', width: 15 } // Add date column
      ]

      data.forEach(item => {
        worksheet.addRow(item.toObject());
    }); 

    res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res);
    res.end();
    }catch(error){
      errorHandlerFunction(res, error)
    }
  }
}