const { clientUsers } = require('../controllers');
const { router } = require('../services/imports');

router.post('/clientUser', clientUsers.createClientUsers);
router.get('/clientUser/:id?', clientUsers.getClientUsers);
router.put('/clientUser/:id', clientUsers.updateClientUser);
router.delete('/clientUser/:id', clientUsers.deleteClientUser);

module.exports = router;