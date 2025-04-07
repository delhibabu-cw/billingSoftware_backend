const { client } = require('../controllers');
const { router } = require('../services/imports');

router.post('/client', client.createClient);
router.get('/client/:id?', client.getClient);
router.put('/client/:id', client.updateClient);
router.delete('/client/:id', client.deleteClient);

module.exports = router;