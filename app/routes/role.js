const { role } = require('../controllers');
const { router } = require('../services/imports');

router.post('/role', role.createRole);
router.get('/role/:id?', role.getRole);
router.get('/auth/role/:id?', role.getRole);
router.put('/role/:id', role.updateRole);
router.delete('/role/:id', role.deleteRole);

module.exports = router;
