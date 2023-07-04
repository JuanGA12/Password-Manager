'use client';

// import '../global.css';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';

const TwoFAComponent = ({ phone, setState, response }) => {
  const { register, handleSubmit } = useForm();
  const [code, setCode] = useState();
  const generateCode = () => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };
  useEffect(() => {
    const code = generateCode();
    sendSMS(phone, code);
    setCode(code);
  }, [phone]);

  const sendSMS = async (phone, codigo) => {
    try {
      let body = {
        phone: phone,
        codigo: codigo,
      };
      const response = await fetch(`http://localhost:4000/send-sms`, {
        method: 'POST',
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
      if (responseData.status === 200) {
        toast.success(responseData.message, {
          autoClose: 3000,
        });
      }
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

  const CustomToastCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} className="custom-toast-close-button">
      OK
    </button>
  );

  const checkphone = async (data) => {
    try {
      if (code == data.userPhoneCode) {
        toast.success('2FA passed', {
          autoClose: 3000,
        });
        Cookies.set(
          'v',
          JSON.stringify({
            vault_data: response.vault_data,
            vault_nonce: response.vault_nonce,
            vault_mac: response.vault_mac,
          }),
          { expires: 7 }
        );
        Cookies.set(
          'u',
          JSON.stringify({
            user_id: response.user_id,
            user_email: response.user_email,
            user_phone: response.user_phone,
          }),
          { expires: 7 }
        );
        setState('Vault');
      } else {
        toast.error('2FA incorrect code', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('2FA incorrect code', {
        autoClose: 3000,
      });
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
            {...register('userPhoneCode', { required: true, maxLength: 6 })}
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
    </div>
  );
};

export default TwoFAComponent;
