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
    url: '/send-email',
    handler: userControllers.sendPasswordRecoveryEmail,
  },
  {
    method: 'POST',
    url: '/obtain-code',
    handler: userControllers.obtainCode,
  },
  {
    method: 'POST',
    url: '/send-sms',
    handler: userControllers.sendSMS,
  },
  {
    method: 'PUT',
    url: '/updateuser',
    handler: userControllers.updateUser,
  },
  {
    method: 'PUT',
    url: '/reset-code',
    handler: userControllers.resetCode,
  },
  {
    method: 'POST',
    url: '/resetCodeAfterTime',
    handler: userControllers.resetCodeAfterTime,
  },
];
module.exports = routes;
