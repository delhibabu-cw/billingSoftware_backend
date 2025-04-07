const { upload } = require('../controllers');
const { router } = require('../services/imports');

router.post('/auth/single-upload', upload.singleUpload);
router.post('/single-upload', upload.singleUpload);


module.exports = router;
