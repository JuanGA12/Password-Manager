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
  {
    method: 'POST',
    url: '/password-recovery',
    handler: userControllers.sendPasswordRecoveryEmail,
  },
  {
    method: 'POST',
    url: '/obtain-code',
    handler: userControllers.logicCode,
  },
  {
    method: 'POST',
    url: '/send-sms',
    handler: userControllers.sendSMS,
  }

];
module.exports = routes;
