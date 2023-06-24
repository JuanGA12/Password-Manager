import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';

import { SketchPicker } from 'react-color';
import PasswordStrengthBar from 'react-password-strength-bar';
import React, { useEffect, useState } from 'react';


//Iconos
import { FaEye, FaEyeSlash, FaEnvelope,FaPhone, FaQuestionCircle ,  FaUnlockAlt} from 'react-icons/fa';


//Alertas
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';


const FormPasswordRecovery = ({ state, setState }) => {
  const { register, handleSubmit } = useForm();

  const [selectedColor, setSelectedColor] = useState('#000000');
  const [masterPassword, setMasterPassword] = useState('');

  const [userPassword, setUserPassword] = useState('');


  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [toastId, setToastId] = useState(null);
  const [phoneAlertShown, setPhoneAlertShown] = useState(false);

  const [isPasswordEmpty, setIsPasswordEmpty] = useState(true);

  const [isMasterPasswordEmpty, setIsMasterPasswordEmpty] = useState(true);

  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  const [recoveryEmail, setRecoveryEmail] = useState('');

  //Almacenar la nueva contrasena del usuario
  const [newPassword, setNewPassword] = useState('');



  
  const handlePasswordRecoveryClick = () => {
    setShowPasswordRecovery(true);
  };

  const handlePasswordRecoveryClose = () => {
    setShowPasswordRecovery(false);
  };

  const handlePasswordRecoverySubmit = async (data) => {
    try {

      let body = {};
      body = {
          email: data.email,
        };
      
      console.log(body)

      const response = await fetch(`http://localhost:4000/password-recovery`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
      }
      });
      
      console.log(response)
      
      
      const responseData = await response.json();
      console.log(responseData);
      
  
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      
      // Restablecer el valor del email en el estado
      //setRecoveryEmail('');
  
      toast.success('Se ha enviado un correo electrónico de recuperación de contraseña.', {
        autoClose: 3000,
      });
    } catch (error) {
  
      toast.error('Se ha producido un error en la recuperación de contraseña.', {
        autoClose: 3000,
      });
    }
  };
  

  const handlePhoneKeyPress = (e) => {
    const key = e.key;
    if (!/^[0-9]+$/.test(key)) {
      e.preventDefault();
      if (!phoneAlertShown) {
        toast.error('Solo se permiten caracteres numéricos en el campo de teléfono.', {
          autoClose: 3000,
          onClose: () => setPhoneAlertShown(false), // Restablecer el estado de phoneAlertShown cuando se cierre la alerta
        });
        setPhoneAlertShown(true);
      }
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setUserPassword(password);
    setIsPasswordEmpty(password === '');
  };

  const handleMasterPasswordChange = (e) => {
    const masterpassword = e.target.value;
    setMasterPassword(masterpassword);
    setIsMasterPasswordEmpty(masterpassword === '');
  };
  

  const CustomToastCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} className="custom-toast-close-button">
      OK
    </button>
  );
  return (
    <div className="form">

    <form onSubmit={handleSubmit(handlePasswordRecoverySubmit)}>
        <h1>Password Recovery</h1>

        <div className="password-recovery">
        <input
            placeholder="Email"
            onChange={(e) => setRecoveryEmail(e.target.value)}
            {...register('email', { required: true })}
        />
        <input
            placeholder="New Password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
        />

        <p>Please enter your email address and set a new password</p>
        <button>Send</button>
        <button onClick={handlePasswordRecoveryClose}>Close</button>
        </div>
    </form>

      <ToastContainer
      position="top-right"
      transition={Slide}
      draggable={false}
      closeButton={<CustomToastCloseButton />}
      toastClassName="custom-toast"
    />
      <div className="help-icon-container">
        <FaQuestionCircle className="help-icon" />
      </div>

    </div>
  );
};

export default FormPasswordRecovery;