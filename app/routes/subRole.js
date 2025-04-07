const { subRole } = require('../controllers');
const { router } = require('../services/imports');

router.post('/subRole', subRole.createRole);
router.get('/subRole/:id?', subRole.getRole);
router.get('/auth/subRole/:id?', subRole.getRole);
router.put('/subRole/:id', subRole.updateRole);
router.delete('/subRole/:id', subRole.deleteRole);

module.exports = router;
