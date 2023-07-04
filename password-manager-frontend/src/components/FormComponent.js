import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { SketchPicker } from 'react-color';
import PasswordStrengthBar from 'react-password-strength-bar';
import { useState } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaPhone } from 'react-icons/fa';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';
import { useRouter } from 'next/navigation';
import {
  arrayBufferToBase64,
  encryptVault,
  generateMasterPassword,
} from '@/utils/crypto';
import TwoFAComponent from './TwoFAComponent';

const FormComponent = ({ state, setState }) => {
  const { register, handleSubmit } = useForm();
  const [selectedColor, setSelectedColor] = useState('#fff');
  const [masterPassword, setMasterPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(true);
  const [isMasterPasswordEmpty, setIsMasterPasswordEmpty] = useState(true);
  const [phase, setPhase] = useState('Login/Register');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [userPhone, setUserPhone] = useState();
  const [responseData, setResponse] = useState();
  const router = useRouter();
  const PasswordRecoverySubmit = async (data) => {
    try {
      const body = { email: data.email };
      const response = await fetch(`http://localhost:4000/send-email`, {
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
      fetch(`http://localhost:4000/resetCodeAfterTime`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success(responseData.message, {
        autoClose: 3000,
      });
      router.push(`/code-password-recovery?email=${data.email}`);
    } catch (error) {
      toast.error(error, {
        autoClose: 3000,
      });
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

  const onSubmit = async (data) => {
    try {
      const route = state == 'Register' ? 'createuser' : 'loginuser';
      let body = {};
      if (state == 'Register') {
        body = {
          email: data.email,
          phone: data.phone,
          password: data.password,
        };
      } else if (state == 'Login') {
        body = {
          email: data.email,
          password: data.password,
        };
      }

      // Eliminar propiedades no deseadas
      delete body.masterPassword;
      delete body.selectedColor;
      const response = await fetch(`http://localhost:4000/${route}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const responseData = await response.json();
      if (!response.ok) {
        toast.error(responseData.message, {
          autoClose: 3000,
        });
        throw new Error(responseData.message);
      }

      setResponse(responseData);
      if (state == 'Login') {
        setUserPhone(responseData.user_phone);
        setPhase('2FA');
      } else {
        const secret = generateMasterPassword(
          masterPassword,
          selectedColor,
          data.email
        );
        const nonce_ = arrayBufferToBase64(
          crypto.getRandomValues(new Uint8Array(12))
        );
        const { encrypted, nonce, mac } = await encryptVault(
          '',
          secret,
          nonce_
        );
        const rpt = await fetch('http://localhost:4000/updatevault', {
          method: 'PUT',
          body: JSON.stringify({
            data: encrypted,
            user_id: responseData.user_id,
            nonce: nonce,
            mac: mac,
          }),
        });
        const rptData = await rpt.json();
        if (!rpt.ok) {
          toast.error(rptData.message, {
            autoClose: 3000,
          });
          throw new Error(rptData.message);
        }
        Cookies.set(
          'v',
          JSON.stringify({
            vault_data: encrypted,
            vault_nonce: nonce,
            vault_mac: mac,
          }),
          { expires: 7 }
        );
        Cookies.set(
          'u',
          JSON.stringify({
            user_id: responseData.user_id,
            user_email: responseData.user_email,
            user_phone: responseData.user_phone,
          }),
          { expires: 7 }
        );
        toast.success(responseData.message, {
          autoClose: 3000,
        });
        setState('Vault');
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
  return (
    <div>
      {phase == 'Login/Register' && (
        <div className="form">
          <h1>{state}</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-container">
              <input
                placeholder={'Email'}
                {...register('email', { required: true, maxLength: 40 })}
                className="input-field"
              />
              <div className="input-icon">
                <FaEnvelope />
              </div>
            </div>

            <div className="input-container">
              <input
                placeholder={'Password'}
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: true, maxLength: 20 })}
                onChange={(e) => {
                  setUserPassword(e.target.value);
                  handlePasswordChange(e);
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
            </div>

            {!isPasswordEmpty && (
              <PasswordStrengthBar
                password={userPassword}
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

            {state == 'Register' && (
              <>
                <div className="input-container">
                  <input
                    placeholder={'Phone Number'}
                    {...register('phone', { required: true, maxLength: 20 })}
                    // onKeyPress={handlePhoneKeyPress}
                  />
                  <div className="input-icon">
                    <FaPhone />
                  </div>
                </div>

                <div className="input-container">
                  <input
                    placeholder="Master Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('masterpassword', {
                      required: true,
                      maxLength: 40,
                    })}
                    value={masterPassword}
                    onChange={(e) => {
                      handleMasterPasswordChange(e);
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
                </div>

                {!isMasterPasswordEmpty && (
                  <PasswordStrengthBar
                    password={masterPassword}
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

                <div className="color-picker-container">
                  <label>Elige un color</label>
                  <div style={{ display: 'flex' }}>
                    <div
                      style={{
                        padding: '5px',
                        background: '#fff',
                        borderRadius: '1px',
                        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                        display: 'inline-block',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        marginRight: '10px',
                      }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '14px',
                          borderRadius: '2px',
                          backgroundColor: selectedColor,
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>{selectedColor}</div>
                  </div>
                  {showColorPicker && (
                    <SketchPicker
                      color={selectedColor}
                      onChange={(color) => setSelectedColor(color.hex)}
                    />
                  )}
                </div>
              </>
            )}
            <h3
              style={{ cursor: 'pointer' }}
              onClick={() =>
                setState(state == 'Register' ? 'Login' : 'Register')
              }
            >
              {state == 'Register' ? 'Login?' : 'Register?'}
            </h3>
            <h4
              className="forgot-password-link"
              style={{ cursor: 'pointer' }}
              onClick={() => setPhase('PasswordRecovery')}
            >
              Forgot password?
            </h4>
            <input type="submit" />
          </form>
        </div>
      )}
      {phase == 'PasswordRecovery' && (
        <div className="form">
          <form onSubmit={handleSubmit(PasswordRecoverySubmit)}>
            <h1>Password Recovery</h1>
            <div className="password-recovery">
              <input
                type="email"
                placeholder="email"
                {...register('email', { required: true })}
              />
              <p>
                Please, enter your email address and we'll send you instructions
                on how to reset your password
              </p>
              <button type="submit">Send</button>
            </div>
          </form>
        </div>
      )}
      {phase == '2FA' && (
        <TwoFAComponent
          phone={userPhone}
          setState={setState}
          response={responseData}
        />
      )}

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

export default FormComponent;
