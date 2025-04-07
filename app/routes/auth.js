const { auth } = require('../controllers');
const { router } = require('../services/imports');

router.post('/otp/send', auth.sendOtp);
router.post('/otp/verify', auth.verifyOtp);
router.post('/signin', auth.signin);
router.put('/signup/form/:id', auth.signupForm);


module.exports = router;
