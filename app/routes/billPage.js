const { billPage } = require('../controllers');
const { router } = require('../services/imports');

router.post('/billPage', billPage.createBillPage);
router.get('/billPage', billPage.getBillPage);
router.put('/billPage/:id', billPage.updateBillPage);

module.exports = router;