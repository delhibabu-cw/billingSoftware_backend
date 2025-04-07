const { router } = require('../services/imports');
const {product } = require('../controllers');

router.post('/product', product.create);
router.get('/product/:id?', product.get);
router.get('/auth/product/:id?', product.get);
router.put('/product/:id', product.update);
router.delete('/product/:id', product.delete);

module.exports = router;