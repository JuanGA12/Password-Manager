'use client';

import '../globals.css';

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
import Link from 'next/link'


const page = ({ state, setState }) => {

  const { register, handleSubmit } = useForm();

  const [isPasswordEmpty, setIsPasswordEmpty] = useState(true);

  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  const [newpasswordrecovery, setnewpasswordrecovery] = useState('');


  
  const RefreshPage = () => {

    
    // Recargar la página
    location.reload();
  };

  const handlePasswordRecoveryClick = () => {
    setShowPasswordRecovery(true);
  };

  const handlePasswordRecoveryClose = () => {
    setShowPasswordRecovery(false);
  };

  const handlePasswordRecoveryChange = (e) => {
    const passwordrecovery = e.target.value;
    setnewpasswordrecovery(passwordrecovery);
    setIsPasswordEmpty(passwordrecovery === '');
  };

  const CustomToastCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} className="custom-toast-close-button">
      OK
    </button>
  );


  return (
    <div className="form">

    <form >
        <h1>Password Recovery</h1>
        <p>Enter the new password</p>
        <div className="password-recovery">
        <input
                placeholder={'password'}
                type={showPasswordRecovery ? 'text' : 'password'}
                {...register('password', { required: true, maxLength: 20 })}
                
                
                onChange={(e) => {
                  setnewpasswordrecovery(e.target.value);
                  handlePasswordRecoveryChange(e); 
                }}
              />
              <div className="input-icon">
              <div className="password-icon" onClick={() => setShowPasswordRecovery(!showPasswordRecovery)}>
                {showPasswordRecovery ? <FaEye  /> : <FaEyeSlash/>}
              </div>
            </div>
            {!isPasswordEmpty && (
          <PasswordStrengthBar password={newpasswordrecovery} barColors={['#00000000','#ff0000', '#ffa500', '#ffff00', '#00ff00','#00ff00']} />
          )}
        </div>       
        <button 
        
        onClick={() => RefreshPage()}
        > Confirm</button>
       
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

export default page;
