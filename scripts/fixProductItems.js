const mongoose = require('mongoose');
const db = require('../app/models/index'); // wherever your db connection & models are

const start = async () => {
  try {
    await mongoose.connect('mongodb+srv://delhibabucw:RLDB2003@cluster0.hudkl.mongodb.net/'); // change db name

    const categories = await db.productCategory.find({ isDeleted: false });

    for (const category of categories) {
      const products = await db.product.find({
        category: category._id,
        isDeleted: false,
      });

      const productIds = products.map((p) => p._id);

      await db.productCategory.findByIdAndUpdate(category._id, {
        $set: {
          productItems: productIds,
          products: productIds.length,
        },
      });

      console.log(
        `Updated Category: ${category.name}, Total Products: ${productIds.length}`
      );
    }

    console.log('✅ Data Fix Completed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
