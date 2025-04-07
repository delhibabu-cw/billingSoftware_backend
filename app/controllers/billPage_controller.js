const responseMessages = require("../middlewares/response-messages");
const { errorHandlerFunction } = require("../middlewares/error");
const db = require("../models");
const { mongoose } = require("../services/imports");
const { populate } = require("../models/roles_model");


module.exports = {
  createBillPage: async (req, res) => {
    try {
      console.log(req.decoded);

        const client = await db.client.findOne({ _id: req.decoded.user_id });
            if (!client) {
              return res.clientError({ msg: "Client not found." });
            }
      
      req.body.clientId = client._id;
      console.log("validatedData--------", req.body);

      const data = await db.billPage.create(req.body);
      console.log("data----", data);

      if (data?._id) {

        await db.client.findByIdAndUpdate(req.body.clientId, {
            $set: { billPageDetails: "yes" }
          });

        return res.success({
          msg: 'BillPage Details Added Successfully!!!',
          result: data,
        });
      }

      return res.clientError({
        msg: responseMessages[1017],
      });
    } catch (error) {
        errorHandlerFunction(res, error);
      }
  },
   getBillPage: async (req, res) => {
      try {
        console.log("decode", req.decoded);
        console.log("validatedData", req.body);
    
        // const _id = req.params.id;
        const filterQuery = { isDeleted: false, clientId: req.decoded.user_id };
    
        // const populateValues = [{ path: "employee", select: "fullName mobile unquieId", populate: { path: 'subRole', select: 'name' } },
        //   { path : 'selectedProducts', populate: { path: 'productId' , select: 'name productId img_url ' } }
        // ];
    
        // const selectValues = "-isDeleted -createdAt -updatedAt";
    
        // If a specific ID is provided, return only that product
        // if (_id) {
          let data = await db.billPage
            .findOne(filterQuery)
            // .populate(populateValues)
  
            console.log('singleData',data);
    
          if (!data) {
            return res.clientError({ msg: responseMessages[1014] });
          }
    
          return res.success({
            msg: responseMessages[1018],
            result: data,
          });
        // }
    
    
        // Apply additional filters from query params
        // const { search,date } = req.query;
        // if (search) filterQuery.billNo = { $regex: search, $options: "i" };
        //   // **Filter by Date Range (Start and End of the Day)**
        //   if (date) {
        //     const startOfDay = new Date(date);
        //     startOfDay.setUTCHours(0, 0, 0, 0);

        //     const endOfDay = new Date(date);
        //     endOfDay.setUTCHours(23, 59, 59, 999);

        //     filterQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
        //   }
    
        // const sort = { createdAt: -1 };
    
        // // Fetch all matching products without pagination
        // let data = await db.billPage
        //   .find(filterQuery)
        // //   .populate(populateValues)
        //   .sort(sort);
  
        //   console.log('arrayData',data);
          
    
        // if (!data.length) {
        //   return res.success({
        //     msg: responseMessages[1014],
        //     result: [],
        //   });
        // }
    
        // return res.success({
        //   msg: responseMessages[1018],
        //   result: data,
        // });
      } catch (error) {
        errorHandlerFunction(res, error);
      }
    }, 
     updateBillPage: async (req, res) => {
        try {
          const _id = req.params.id;
          const filterQuery = {
            isDeleted: false,
            _id,
            clientId: req.decoded.user_id,
          };
          const checkExist = await db.billPage.findOne(filterQuery);
          if (!checkExist) {
            return res.clientError({
              msg: responseMessages[1015],
            });
          }
          // const updateData = {};
          // Object.keys(req.body).forEach((key) => {
          //   updateData[key] = req.body[key];
          // });
          // const data = await db.user.updateOne(filterQuery, updateData)
          const data = await db.billPage.updateOne(filterQuery, req.body);
          if (data.modifiedCount) {
            return res.success({
              msg: responseMessages[1019],
              result: data,
            });
          }
          return res.clientError({
            msg: responseMessages[1020],
          });
        } catch (error) {
          errorHandlerFunction(res, error);
        }
      },
}