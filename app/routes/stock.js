const { stock } = require('../controllers');
const { router } = require('../services/imports');

router.post('/stock', stock.createStock);
router.get('/stock/:id?', stock.getStock);
router.put('/stockCount/:id', stock.updateCount);
router.put('/stock/:id', stock.updateStock);

module.exports = router;