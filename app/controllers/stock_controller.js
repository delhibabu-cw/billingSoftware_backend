const { errorHandlerFunction } = require("../middlewares/error");
const responseMessages = require("../middlewares/response-messages");
const db = require("../models");
const { mongoose } = require("../services/imports");
const { createSlug } = require("../utils/common_utils");

let skuCounter = 0;

function generateSKU(category, product) {
  const extractCode = (name) => {
    const cleanName = name.replace(/^\d+\s*/, "");
    return cleanName.substring(0, 3).toUpperCase();
  };
  const productCode = extractCode(product);
  skuCounter += 1;
  const skuNumber = skuCounter.toString().padStart(3, "0");
  return `PRO${productCode}${skuNumber}`;
}

module.exports = {
    createStock: async (req, res) => {
        try {
          const { clientId, stockCategory } = req.body;
          const data = req.body[stockCategory] || req.body.data;

          console.log("data",data);
          
      
          const client = await db.client.findById(clientId);
          if (!client) {
            return res.status(404).json({ message: "Client not found" });
          }
      
          let createdProduct = null;
          let productId = null;
      
          if (stockCategory === "products") {
            const categoryDoc = await db.productCategory.findById(data.category);
            const categoryName = categoryDoc?.name || "GEN";
            const product_url = await createSlug(data.name);
      
            productId = generateSKU(categoryName, data.name);
            const productPayload = {
              ...data,
              productId,
              clientId,
              product_url,
              productAddedFromStock: "yes",
            };
      
            createdProduct = await db.product.create(productPayload);
      
            if (createdProduct?._id) {
              await db.productCategory.findByIdAndUpdate(data.category, {
                $inc: { products: 1 },
                $push: { productItems: createdProduct._id },
              });
            } else {
              return res.status(500).json({ message: "Product creation failed" });
            }
          }
      
          // Create stock object
          const stockObject = {
            clientId,
            stockCategory,
            status: "active",
            isDeleted: false,
          };
      
          if (stockCategory === "purchase") {
            stockObject.purchase = data;
          } else if (stockCategory === "products") {
            const price = Number(data?.price) || 0;
            const profitMargin = Number(data?.profitMargin) || 0;
            const actualPrice = Number(data?.actualPrice) || 0;
            const gstAmountPerUnit = Number(data?.gstAmount) || 0;
            const initialCount = Number(data?.count) || 0;
            
            // ✅ Safe calculations
            const totalGst = gstAmountPerUnit * initialCount;
            const totalAmount = (actualPrice + gstAmountPerUnit) * initialCount;
          
            const countUpdates = [{
              price,
              profitMargin,
              actualPrice,
              gstAmount: totalGst,          // ✅ total GST for all units
              count: initialCount,
              totalAmount: totalAmount,     // ✅ total amount including GST
              date: new Date(),
            }];
          
            stockObject.products = {
              ...data,
              _id: createdProduct?._id,
              productId,
              actualPrice,
              count: initialCount,
              countUpdates,
            };
          }
      
          console.log("stockObject",stockObject);
          
          const newStock = await db.stock.create(stockObject);

      
          if(newStock && newStock?._id){
            if(stockCategory === 'purchase'){
                return res.success({
                    msg: 'Purchase Added successfully',
                    result: {
                        stock : newStock
                      },
                  });
            }else if(stockCategory === 'products'){
                return res.success({
                    msg: 'Stock Products created successfully',
                    result: {
                        product: createdProduct,
                        stock: newStock,
                      },
                  });
            }
          }

          return res.clientError({
            msg: responseMessages[1017],
          });
        } catch (error) {
          errorHandlerFunction(res, error);
        }
      }
      ,
  getStock: async (req, res) => {
    try {
      console.log("decode", req.decoded);
      console.log("validatedData", req.query);

      const _id = req.params.id;
      const filterQuery = { isDeleted: false, clientId: req.decoded.user_id };

      console.log("filterquery", filterQuery);

      const populateValues = [
        {
          path: "clientId",
          select: "fullName unquieId",
        },
        {
          path: "products.category",
          select: "name products",
          //   populate: {
          //     path: 'role',
          //     select: 'name'
          //   }
        },
      ];

      // const selectValues = "-isDeleted -createdAt -updatedAt";

      // If a specific ID is provided, return only that product
      if (_id) {
        let data = await db.stock
          .findOne({ ...filterQuery, _id })
          .populate(populateValues);
        // .select(selectValues);

        console.log("singleData", data);

        if (!data) {
          return res.clientError({ msg: responseMessages[1014] });
        }

        // ✅ Sort countUpdates and salesUpdates by date descending
        if (data?.products?.countUpdates?.length) {
            data.products.countUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        if (data?.products?.salesUpdates?.length) {
            data.products.salesUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return res.success({
          msg: responseMessages[1018],
          result: data,
        });
      }

      // Apply additional filters from query params
      const { search, stockCategory, date, product_Id } = req.query;
      if (stockCategory) filterQuery.stockCategory = stockCategory;
      if (product_Id) filterQuery['products._id'] = product_Id;
      if (search) {
        // Search by nested name (products.name or purchase.name)
        filterQuery.$or = [
          { "products.name": { $regex: search, $options: "i" } },
          { "purchase.name": { $regex: search, $options: "i" } },
        ];
      }
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        filterQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
      }

      const sort = { createdAt: -1 };

      // Fetch all matching products without pagination
      let data = await db.stock
        .find(filterQuery)
        .populate(populateValues)
        //   .select(selectValues)
        .sort(sort);

      console.log("arrayData", data);

      if (!data.length) {
        return res.success({
          msg: responseMessages[1014],
          result: [],
        });
      }

      // ✅ Sort countUpdates and salesUpdates for each item
      data = data.map((item) => {
        if (item?.products?.countUpdates?.length) {
          item.products.countUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        if (item?.products?.salesUpdates?.length) {
          item.products.salesUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        return item;
      });

      return res.success({
        msg: responseMessages[1018],
        result: product_Id ? data[0] : data,
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  updateStock: async (req, res) => {
    try {
      const  stockId  = req.params.id;
      const { clientId, stockCategory } = req.body;
      const data = req.body[stockCategory] || req.body.data;
  
        console.log('stockId',stockId);
        console.log('clientId',clientId);
        console.log('stockCategory',stockCategory);
        
      // ✅ Validation
      if (!stockId || !clientId || !stockCategory) {
        return res.clientError({
          msg: "Missing required fields: stockId, clientId, or stockCategory",
        });
      }
  
      // ✅ Check if stock exists
      const stock = await db.stock.findOne({
        _id: stockId,
        isDeleted: false,
        clientId,
      });
  
      if (!stock) {
        return res.clientError({ msg: "Stock not found" });
      }
  
      // ✅ Handle product-based stock update
      if (stockCategory === "products") {
        const {
          name,
          price,
          actualPrice,
          count,
          gstAmount,
          profitMargin,
          quantity,
          isgst,
          category,
          img_url,
          description,
        } = data;
  
        const updatedProductData = {
          name,
          price: Number(price) || 0,
          actualPrice: Number(actualPrice) || 0,
          count: Number(count) || 0,
          gstAmount: Number(gstAmount) || 0,
          profitMargin: Number(profitMargin) || 0,
          quantity,
          isgst,
          category,
          img_url,
          description,
        };
  
        // ✅ Update the linked product as well
        const productId = stock.products?._id;
        if (productId) {
          await db.product.findByIdAndUpdate(productId, {
            $set: {
              ...updatedProductData,
            },
          });
        }
  
        // ✅ Update stock.products object
        await db.stock.findByIdAndUpdate(stockId, {
          $set: {
            "products.name": name,
            "products.price": Number(price),
            "products.actualPrice": Number(actualPrice),
            "products.count": Number(count),
            "products.gstAmount": Number(gstAmount),
            "products.profitMargin": Number(profitMargin),
            "products.quantity": quantity,
            "products.isgst": isgst,
            "products.category": category,
            "products.img_url": img_url,
            "products.description": description,
          },
        });
      }
  
      return res.success({
        msg: "Stock updated successfully",
      });
    } catch (error) {
      console.error("Update stock error:", error);
      errorHandlerFunction(res, error);
    }
  },  
  updateCount: async (req, res) => {
    try {
      const _id = req.params.id;
      const additionalCount = req.body.additionalCount;
      const product_id = req.body.product_Id;
  
      // Fetch stock
      const stock = await db.stock.findOne({
        _id,
        isDeleted: false,
        clientId: req.decoded.user_id,
      });
  
      if (!stock) {
        return res.clientError({ msg: responseMessages[1014] });
      }
  
      // Fetch product
      const product = await db.product.findOne({
        _id: product_id,
        isDeleted: false,
        clientId: req.decoded.user_id,
      });
  
      if (!product) {
        return res.clientError({ msg: 'Product Not Found' });
      }
  
      // Get current values
      const price = stock.products.price || 0;
      const profitMargin = stock.products.profitMargin || 0;
      const actualPrice = stock.products.actualPrice || 0;
      const gstPerUnit = stock.products.gstAmount || 0;
  
      // Calculate new entry values
      const totalGst = gstPerUnit * additionalCount;
      const totalAmount = (actualPrice + gstPerUnit) * additionalCount;
  
      const newEntry = {
        price,
        profitMargin,
        actualPrice,
        gstAmount: totalGst, // total GST for all added units
        count: additionalCount,
        totalAmount,
        date: new Date(),
      };
  
      // Push new count update
      await db.stock.updateOne(
        { _id },
        {
          $push: { "products.countUpdates": newEntry },
          $inc: { "products.count": additionalCount } // 👈 Just add, don't recalculate
        }
      );
  
      // Update product count too
      await db.product.updateOne(
        { _id: product_id },
        {
          $inc: { count: additionalCount }
        }
      );
  
      const updatedCount = stock.products.count + additionalCount;
  
      return res.success({
        msg: "Stock and product count updated successfully",
        result: { count: updatedCount },
      });
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  }
  
  
  
};
