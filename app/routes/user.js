const { user } = require('../controllers');
const { router } = require('../services/imports');

router.post('/user', user.createUser);
router.get('/user/:id?', user.getUser);
router.put('/user/:id', user.updateUser);
router.delete('/user/:id', user.deleteUser);
router.get('/profile', user.getProfile);
router.get('/download-user', user.getUserExcelData);

module.exports = router;