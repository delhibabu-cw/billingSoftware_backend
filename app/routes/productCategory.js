const { productCategory } = require('../controllers');
const { router } = require('../services/imports');

router.post('/productCategory', productCategory.create);
router.get('/productCategory/:id?', productCategory.get);
router.put('/productCategory/:id', productCategory.update);
router.delete('/productCategory/:id', productCategory.delete);
router.post('/productCategory-status/:id', productCategory.status)
module.exports = router;
