const User = require('../models/user.model.js');
const vaultControllers = require('./vault.controller');
const logger = require('../utils/logger.js');
const argon2 = require('argon2');

//import emailjs from '@emailjs/browser';

//Funcion para recuperar password
const nodemailer = require('nodemailer');

const sendPasswordRecoveryEmail = async (request, reply) => {
  // Obtener la dirección de correo electrónico del cuerpo de la solicitud
  const { email } = request.body;



  try {
    // Lógica de generación del enlace de recuperación de contraseña
    //const recoveryLink = generateRecoveryLink(email);
    console.log(email);
    
    const transporter = nodemailer.createTransport({
      service:"gmail",
      auth: {
        user: 'darklay77@gmail.com',
        pass: 'tzssetnxwpdmeqqc',
      },
    });
    //console.log(transporter);
    const codigo = generateCode();
    console.log(codigo)
    //Actulizo el codigo del usuario
    await User.updateOne({ email: email }, { code: codigo });


    //${codigo}
    const mailOptions = {
      from: 'darklay77@gmail.com',
      to: email,
      subject: 'Password Recovery by password manager - chunte',
      html: `
        <p>We have received a request to reset the password for your account on Password Manager - Chunte.</p>
        <p>To complete this process, please put your code in the password recovery page:</p>
        <a href="LINK">Reset Password</a>`,
    };

    
    /*
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }*/

    //const updatedUser = await User.findOne({ email: email });
    //const updatedCodigo = updatedUser.code;
    //console.log(updatedCodigo);
    //await transporter.sendMail(mailOptions);
    //console.log(request);



    

    //Una vez que se envie correctamente todo, guardar el code en la base de datos del usuario(cambiando la coleccion del ususario)
    //Hago una query que me traiga el code del usuario del email que tengo.



    console.log('La función sendPasswordRecoveryEmail se ha ejecutado correctamente');
    reply.code(200).send({ message: 'Password recovery email sent successfully' });
    
  } catch (error) {
    console.error('Error sending password recovery email:', error);
    reply.code(500).send({ error: 'An error occurred while sending the password recovery email' });
    
  }
};


const generateCode = () => {

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};


const generateRecoveryLink = (email) => {


  
  return `link`;
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
        user_id: user._id,
        user_email: user.email,
        user_pass: user.password,
        vault_data: vault.data,
        user_vault: user.hasVault,
        vault_nonce: vault.nonce,
        vault_mac: vault.mac,
      });
    }
    logger.error('error creating user');
    return reply.code(401).send({ message: 'Error' });
  } catch (err) {
    logger.error(err, 'error creating user');
    reply.code(401).send(err);
  }
};

const loginUser = async (request, reply) => {
  try {
    const { email, password } = JSON.parse(request.body);
    const user = await User.findOne({ email: email });
    const verified = await argon2.verify(user.password, password);
    if (!user || !verified) {
      logger.error('error login user');
      return reply.status(401).send({
        message: 'Invalid email or password',
      });
    }

    const vault = await vaultControllers.findVault({
      user_id: user._id,
    });
    if (!vault) {
      logger.error('error finding vault');
      return reply.status(401).send({
        message: 'Error finding vault by user_id',
      });
    }

    return reply.code(200).send({
      user_id: user._id,
      user_email: user.email,
      user_pass: user.password,
      vault_data: vault.data,
      user_vault: user.hasVault,
      vault_nonce: vault.nonce,
      vault_mac: vault.mac,
    });
  } catch (err) {
    logger.error(err, 'error login user');
    return reply.code(401).send(err);
  }
};

const logicCode = async (request, reply) => {
  try {

    console.log("Ingrese a email")
    const {email} = request.body;
    console.log("Ingrese a email")
    console.log(email)
    const user = await User.findOne({ email: email });
    console.log("Imprimiendo el code del usuario")
    console.log(user.code)

    return reply.code(200).send({
      user_code: user.code,     
    });
    
  } catch (err) {
    logger.error(err, 'error obtain code');
    return reply.code(401).send(err);
  }
};

module.exports = {
  createUser,
  loginUser,
  sendPasswordRecoveryEmail,
  logicCode,
};
