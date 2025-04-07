const { billPage } = require('../controllers');
const { router } = require('../services/imports');

router.post('/billPage', billPage.createBillPage);
router.get('/billPage/:id?', billPage.getBillPage);
router.put('/billPage/:id', billPage.updateBillPage);

module.exports = router;