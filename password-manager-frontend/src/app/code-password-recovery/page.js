'use client';

import '../globals.css';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { SketchPicker } from 'react-color';
import PasswordStrengthBar from 'react-password-strength-bar';
import React, { useEffect, useState } from 'react';
//Iconos
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
  FaQuestionCircle,
  FaUnlockAlt,
} from 'react-icons/fa';
//Alertas
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import { useHistory } from 'react-router-dom';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const page = ({ state, setState }) => {
  const { register, handleSubmit } = useForm();

  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  console.log('Email grande');
  console.log(email);

  const [isPasswordEmpty, setIsPasswordEmpty] = useState(true);

  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  const [newpasswordrecovery, setnewpasswordrecovery] = useState('');

  const router = useRouter();

  const handlePasswordRecoveryClick = () => {
    setShowPasswordRecovery(true);
  };

  const handlePasswordRecoveryClose = () => {
    setShowPasswordRecovery(false);
  };

  const handlePasswordRecoveryChange = (e) => {
    e.preventDefault();
    const passwordrecovery = e.target.value;
    setnewpasswordrecovery(passwordrecovery);
  };

  const ComparisonCode = async (data, email) => {
    try {
      console.log('Ingrese a la funcion ComparisonCode');
      console.log(data);
      console.log(email);

      let userCode = ''; // Variable para almacenar user_code

      let body = {};
      body = {
        email: email,
      };
      console.log(body);

      const response = await fetch(`http://localhost:4000/obtain-code`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      //console.log(response)

      const responseData = await response.json();
      console.log(responseData);

      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      userCode = responseData.user_code;
      console.log('Imprimiendo el userCode:');
      console.log(userCode);

      await toast.success('Se envio su codigo correctamente', {
        autoClose: 3000,
      });

      return userCode;

      // llevar al login
      //router.push(`/password-recovery`);

      //location.reload();
    } catch (error) {
      //console.error('There has been a problem with the password recovery:', error);

      toast.error('Se ha producido un error en el codigo enviado.', {
        autoClose: 3000,
      });
    }
  };

  const CustomToastCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} className="custom-toast-close-button">
      OK
    </button>
  );

  const check = async (data) => {
    try {
      console.log('Ingrese a la funcion check');

      const BackendCode = await ComparisonCode(data, email);
      console.log('Code del backend');
      console.log(BackendCode);
      if (newpasswordrecovery === BackendCode) {
        router.push(`/password-recovery`);
      }
    } catch (error) {
      console.error('Code incorrect:', error);
    }
  };

  return (
    <div className="form">
      <form onSubmit={handleSubmit(check)}>
        <h1>Code Password Recovery</h1>
        <></>
        <p>Enter the code</p>
        <div className="password-recovery">
          <input
            placeholder={'password'}
            {...register('password', { required: true, maxLength: 20 })}
            onChange={(e) => {
              //setnewpasswordrecovery(e.target.value);
              handlePasswordRecoveryChange(e);
            }}
          />
        </div>

        <button type="submit">Send</button>
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
