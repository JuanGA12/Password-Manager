const User = require('../models/user.model.js');
const vaultControllers = require('./vault.controller');
const logger = require('../utils/logger.js');
const argon2 = require('argon2');
//Funcion para recuperar password
const nodemailer = require('nodemailer');

const twilio = require('twilio')(
  'AC5859d2c3ea5c5f7dfd2a020e96578a41',
  'becb9c74bf6f0fd37fec63a2b2c2129cº'
);

const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: '2b6ce7a0',
  apiSecret: 'xyvgixwn1XFefNxV',
});

const sendSMS = async (request, reply) => {
  try {
    const { phone, codigo } = request.body;
    // const message = await twilio.messages.create({
    //   from: '+18555012293',
    //   //to: "+51945816007",
    //   to: '+51' + phone,
    //   body:
    //     'Your verification code for password manager - chunte is: ' + codigo,
    // });

    vonage.sms.send({
      to: '51' + phone,
      from: 'Vonage APIs',
      text:
        'Your verification code for password manager - chunte is: ' + codigo,
    });
    return reply.code(200).send({ message: 'SMS sent', status: 200 });
  } catch (error) {
    logger.error('Error sending message:', error);
    return reply.code(400).send({ message: 'Error sending sms', status: 400 });
  }
};

const sendPasswordRecoveryEmail = async (request, reply) => {
  try {
    const { email } = request.body;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'darklay77@gmail.com',
        pass: 'ubjxwiuykqhmatdk',
      },
    });

    const codigo = generateCode();
    await User.updateOne({ email: email }, { code: codigo });
    const mailOptions = {
      from: '"Password Recovery" <darklay77@gmail.com>',
      to: email,
      subject: 'Password Recovery by password manager - chunte',
      html: `
        <p>We have received a request to reset the password for your account on Password Manager - Chunte.</p>
        <p>To complete this process, please put your code in the password recovery page:</p>
        <p><strong>${codigo}</strong></p> `,
    };
    console.log(codigo);
    await transporter.sendMail(mailOptions);
    return reply.code(200).send({
      message: 'Password recovery email sent successfully',
      status: 200,
    });
  } catch (error) {
    logger.error('Error sending password recovery email:', error);
    return reply.code(400).send({
      message: 'Error sending email',
      status: 400,
    });
  }
};

const generateCode = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
};

const createUser = async (request, reply) => {
  try {
    const { email, password, phone } = JSON.parse(request.body);
    const passHashed = await argon2.hash(password);
    const user = new User({ email, password: passHashed, phone });
    await user.save();
    const vault = await vaultControllers.createVault({
      data: '',
      user: user._id,
      nonce: '',
    });
    if (vault) {
      return reply.code(200).send({
        user_phone: user.phone,
        user_id: user._id,
        user_email: user.email,
        vault_data: vault.data,
        vault_nonce: vault.nonce,
        vault_mac: vault.mac,
        message: 'User created successfully',
        status: 200,
      });
    }
    logger.error('error creating user');
    return reply
      .code(400)
      .send({ message: 'Error creating user', status: 400 });
  } catch (err) {
    logger.error(err, 'error creating user');
    return reply
      .code(400)
      .send({ message: 'Error creating user', status: 400 });
  }
};

const loginUser = async (request, reply) => {
  try {
    const { email, password } = JSON.parse(request.body);
    const user = await User.findOne({ email: email });
    const verified = await argon2.verify(user.password, password);

    if (!user || !verified) {
      logger.error('error login user');
      return reply.status(400).send({
        message: 'Invalid email or password',
        status: 400,
      });
    }

    const vault = await vaultControllers.findVault({
      user_id: user._id,
    });

    if (!vault) {
      logger.error('error finding vault');
      return reply.status(400).send({
        message: 'Error finding vault',
        status: 400,
      });
    }

    return reply.code(200).send({
      user_phone: user.phone,
      user_id: user._id,
      user_email: user.email,
      vault_data: vault.data,
      vault_nonce: vault.nonce,
      vault_mac: vault.mac,
      message: 'User logged in',
      status: 200,
    });
  } catch (err) {
    logger.error(err, 'error login user');
    return reply.code(400).send(err);
  }
};

const obtainCode = async (request, reply) => {
  try {
    const { email } = request.body;
    const user = await User.findOne({ email: email });
    if (user.code != '') {
      return reply.code(200).send({
        user_code: user.code,
        message: 'Code generated',
        status: 200,
      });
    }
    return reply.code(400).send({ message: 'No code generated', status: 400 });
  } catch (err) {
    logger.error(err, 'error obtain code');
    return reply.code(400).send({ message: 'No code generated', status: 400 });
  }
};

const updateUser = async (request, reply) => {
  try {
    const body = request.body;
    const passHashed = await argon2.hash(body.password);
    await User.updateOne({ email: body.email }, { password: passHashed });
    return reply.code(200).send({ message: 'Password updated', status: 200 });
  } catch (err) {
    logger.error(err, 'error updating password');
    return reply
      .code(400)
      .send({ message: 'Error updating password', status: 400 });
  }
};
const resetCode = async (request, reply) => {
  try {
    const { email } = request.body;
    await User.updateOne({ email: email }, { code: '' });
    return reply.code(200).send({ message: 'Code reseted', status: 200 });
  } catch (err) {
    logger.error(err, 'error reseting code');
    return reply
      .code(400)
      .send({ message: 'Error reseting code', status: 400 });
  }
};

const resetCodeAfterTime = async (request, reply) => {
  try {
    const { email } = request.body;
    setTimeout(async () => {
      await User.updateOne({ email: email }, { code: '' });
      logger.info('codigo actualizado despues de un tiempo');
    }, 60000);
  } catch (err) {
    logger.error(err, 'Error reseting code after time');
    return reply
      .code(400)
      .send({ message: 'Error reseting code after time', status: 400 });
  }
};
module.exports = {
  createUser,
  loginUser,
  sendPasswordRecoveryEmail,
  obtainCode,
  sendSMS,
  updateUser,
  resetCode,
  resetCodeAfterTime,
};
