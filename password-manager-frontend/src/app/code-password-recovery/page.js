'use client';

import '../globals.css';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
//Alertas
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';
import { useSearchParams } from 'next/navigation';
import InputNewPassword from '@/components/InputNewPassword';

const page = () => {
  const { register, handleSubmit } = useForm();
  const [putNewPassword, setPutNewPassword] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const CustomToastCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} className="custom-toast-close-button">
      OK
    </button>
  );

  const checkCodes = async (data) => {
    try {
      const response = await fetch(`http://localhost:4000/obtain-code`, {
        method: 'POST',
        body: JSON.stringify({ email: email }),
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
      const backendCode = responseData.user_code;
      if (data.code === backendCode) {
        toast.success('Code correct!', {
          autoClose: 3000,
        });
        setPutNewPassword(true);
      } else {
        toast.error('Incorrect code', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Code incorrect:', error);
      toast.error(error, {
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      {!putNewPassword ? (
        <div className="form">
          <form onSubmit={handleSubmit(checkCodes)}>
            <h1>Code Password Recovery</h1>
            <></>
            <p>Enter the code</p>
            <div className="password-recovery">
              <input
                placeholder={'Code'}
                {...register('code', { required: true, maxLength: 20 })}
              />
            </div>

            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <InputNewPassword email={email} />
      )}
      <ToastContainer
        position="top-right"
        transition={Slide}
        draggable={false}
        closeButton={<CustomToastCloseButton />}
        toastClassName="custom-toast"
      />
    </>
  );
};

export default page;
