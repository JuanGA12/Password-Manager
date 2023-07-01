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
  
  const [newpasswordrecovery, setphonecode] = useState('');

  const router = useRouter();

  const handlePhoneCodeChange = (e) => {
    e.preventDefault();
    const phonecode = e.target.value;
    setphonecode(phonecode);
  };

  const ComparisonCodeSMS = async (data, email, phone) => {
    try {
      console.log('Ingrese a la funcion ComparisonCode');
      console.log(data);
      console.log(email);
      console.log(phone);

      //let userCode = ''; // Variable para almacenar user_code

      let body = {};
      body = {
        email: email,
        phone: phone,
      };
      console.log(body);

      const response = await fetch(`http://localhost:4000/send-sms`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });


      const responseData = await response.json();
      console.log(responseData);

      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      //userCode = responseData.user_code;
      //console.log('Imprimiendo el userCode:');
      //console.log(userCode);

      await toast.success('Se envio su sms correctamente', {
        autoClose: 3000,
      });

      //return userCode;

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

  const checkphone = async (data) => {
    try {
      console.log('Ingrese a la funcion check phone');

      

      //const BackendCode = await ComparisonCodeSMS(data, email);
      
      /*console.log('Code del backend');
      console.log(BackendCode);
      if (newpasswordrecovery === BackendCode) {
        router.push(`/password-recovery`);
      }
        */
    } catch (error) {
      console.error('phone incorrect:', error);
    }
  };

  return (
    <div className="form">
      <form onSubmit={handleSubmit(checkphone)}>
        <h1>Code 2FA</h1>
        <></>
        <p>Enter the code that was sent to your phone</p>
        
        <div className="password-recovery">
          <input
            placeholder={'phone code'}
            {...register('password', { required: true, maxLength: 20 })}
            onChange={(e) => {
                handlePhoneCodeChang(e);
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
