'use client';

import { useForm } from 'react-hook-form';
import PasswordStrengthBar from 'react-password-strength-bar';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
//Alertas
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';
import { useRouter } from 'next/navigation';

const InputNewPassword = ({ email }) => {
  const { register, handleSubmit } = useForm();
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();
  const updatePassword = async (data) => {
    try {
      const body = { email: email, password: newPassword };
      const response = await fetch(`http://localhost:4000/updateuser`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();
      if (!response.ok) {
        toast.error(responseData.message, {
          autoClose: 3000,
        });
        throw new Error(responseData.message);
      }

      if (responseData.status == 200) {
        toast.success(responseData.message, {
          autoClose: 3000,
        });
        await fetch(`http://localhost:4000/reset-code`, {
          method: 'PUT',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      router.push('/');
    } catch (error) {
      console.error(
        'There has been a problem with your fetch operation:',
        error
      );
      toast.error(error, {
        autoClose: 3000,
      });
    }
  };

  const handlePasswordRecoveryChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    setIsPasswordEmpty(newPassword === '');
  };

  const CustomToastCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} className="custom-toast-close-button">
      OK
    </button>
  );

  return (
    <div className="form">
      <form onSubmit={handleSubmit(updatePassword)}>
        <h1>Password Recovery</h1>
        <p>Enter the new password</p>
        <div className="password-recovery">
          <input
            placeholder={'password'}
            type={showPassword ? 'text' : 'password'}
            {...register('password', { required: true, maxLength: 20 })}
            onChange={(e) => {
              handlePasswordRecoveryChange(e);
            }}
          />
          <div className="input-icon">
            <div
              className="password-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>
          {!isPasswordEmpty && (
            <PasswordStrengthBar
              password={newPassword}
              barColors={[
                '#00000000',
                '#ff0000',
                '#ffa500',
                '#ffff00',
                '#00ff00',
                '#00ff00',
              ]}
            />
          )}
        </div>
        <button type="submit"> Confirm</button>
      </form>

      <ToastContainer
        position="top-right"
        transition={Slide}
        draggable={false}
        closeButton={<CustomToastCloseButton />}
        toastClassName="custom-toast"
      />
    </div>
  );
};

export default InputNewPassword;
