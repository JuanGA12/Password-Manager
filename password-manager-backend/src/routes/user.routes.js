const userControllers = require('../controllers/user.controller');
const routes = [
  {
    method: 'POST',
    url: '/createuser',
    handler: userControllers.createUser,
  },
  {
    method: 'POST',
    url: '/loginuser',
    handler: userControllers.loginUser,
  },
];
module.exports = routes;
