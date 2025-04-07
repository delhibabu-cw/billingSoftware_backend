const responseMessages = require("../middlewares/response-messages");
const { errorHandlerFunction } = require("../middlewares/error");
const db = require("../models");
const validator = require("../validators/bill");
const {
  paginationFn,
  createSlug,
  checkParams,
} = require("../utils/common_utils");
const { mongoose } = require("../services/imports");
const { populate } = require("../models/roles_model");


module.exports = {
  createBill: async (req, res) => {
    try {
      const { error, validatedData } = await validator.validateCreateBill(req.body);
      if (error) {
        return res.clientError({ msg: error });
      }
  
      const lastBill = await db.bill.findOne().sort({ createdAt: -1 });
      validatedData.billNo = `BILL${lastBill ? lastBill._id.toString().slice(-4) : '0001'}`;
      validatedData.clientId = req.decoded.user_id;
  
      const data = await db.bill.create(validatedData);
  
      if (data?._id) {
        const selectedProducts = validatedData.selectedProducts || [];
  
        // Go through each product
        for (const item of selectedProducts) {
          if (item.productAddedFromStock === "yes") {
            const productId = item.productId;
            const quantity = item.quantity;

            const price = item.price || 0;
            const actualPrice = item.actualPrice || 0; // Assuming same for now, update if needed
            // const totalAmount = item.total || (actualPrice * quantity);
            const totalAmount = item.total;
            const profitMargin = item?.profitMargin;
            const gstAmount = item?.gstAmount;
  
            const salesUpdateEntry = {
              count: quantity,
              actualPrice: actualPrice,
              price: price,
              profitMargin: profitMargin,
              totalAmount: totalAmount,
              gstAmount: gstAmount,
              date: new Date()
            };
  
            // Update product schema
            await db.product.updateOne(
              { _id: productId, isDeleted: false, clientId: req.decoded.user_id },
              {
                $inc: {
                  count: -quantity,
                  sales: quantity
                },
                // $push: {
                //   salesUpdates: salesUpdateEntry
                // }
              }
            );
  
            // Update stock schema
            await db.stock.updateOne(
              {
                "products._id": productId,
                isDeleted: false,
                clientId: req.decoded.user_id
              },
              {
                $inc: {
                  "products.count": -quantity,
                  "products.sales": quantity
                },
                $push: {
                  "products.salesUpdates": salesUpdateEntry
                }
              }
            );
          }
        }
  
        return res.success({
          msg: responseMessages[1034],
          result: data,
        });
      }
  
      return res.clientError({ msg: responseMessages[1017] });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  }
,  
   getBill: async (req, res) => {
      try {
        console.log("decode", req.decoded);
        console.log("validatedData", req.body);
    
        const _id = req.params.id;
        const filterQuery = { isDeleted: false, clientId: req.decoded.user_id };
    
        const populateValues = [{ path: "employee", select: "fullName mobile unquieId", populate: { path: 'subRole', select: 'name' } },
          { path : 'selectedProducts', populate: { path: 'productId' , select: 'name productId img_url ' } }
        ];
    
        // const selectValues = "-isDeleted -createdAt -updatedAt";
    
        // If a specific ID is provided, return only that product
        if (_id) {
          let data = await db.bill
            .findOne(filterQuery)
            .populate(populateValues)
  
            console.log('singleData',data);
    
          if (!data) {
            return res.clientError({ msg: responseMessages[1014] });
          }
    
          return res.success({
            msg: responseMessages[1018],
            result: data,
          });
        }
    
    
        // Apply additional filters from query params
        const { search,date } = req.query;
        if (search) filterQuery.billNo = { $regex: search, $options: "i" };
          // **Filter by Date Range (Start and End of the Day)**
          if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);

            filterQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
          }
    
        const sort = { createdAt: -1 };
    
        // Fetch all matching products without pagination
        let data = await db.bill
          .find(filterQuery)
          .populate(populateValues)
          .sort(sort);
  
          console.log('arrayData',data);
          
    
        if (!data.length) {
          return res.success({
            msg: responseMessages[1014],
            result: [],
          });
        }
    
        return res.success({
          msg: responseMessages[1018],
          result: data,
        });
      } catch (error) {
        errorHandlerFunction(res, error);
      }
    }, 
}