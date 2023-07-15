const vaultControllers = require('../controllers/vault.controller');
const routes = [
  {
    method: 'PUT',
    url: '/updatevault',
    handler: vaultControllers.updateVault,
  },
  {
    method: 'POST',
    url: '/getVault',
    handler: vaultControllers.getVault,
  }  
];
module.exports = routes;
