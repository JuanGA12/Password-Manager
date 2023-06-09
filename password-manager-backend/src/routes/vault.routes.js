const vaultControllers = require('../controllers/vault.controller');
const routes = [
  {
    method: 'PUT',
    url: '/updatevault',
    handler: vaultControllers.updateVault,
  },
];
module.exports = routes;
