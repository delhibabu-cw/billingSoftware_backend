const { bill } = require('../controllers');
const { router } = require('../services/imports');

router.post('/bill', bill.createBill);
router.get('/bill', bill.getBill);

module.exports = router;