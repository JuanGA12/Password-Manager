  import { useForm } from 'react-hook-form';
  import Cookies from 'js-cookie';

  import { SketchPicker } from 'react-color';
  import PasswordStrengthBar from 'react-password-strength-bar';
  import React, { useEffect, useState } from 'react';


  //Iconos
  import { FaEye, FaEyeSlash, FaEnvelope,FaPhone, FaQuestionCircle } from 'react-icons/fa';

  //Alertas
  import { ToastContainer, toast, Slide } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

  import 'react-tooltip/dist/react-tooltip.css'
  import { Tooltip } from 'react-tooltip'


  const FormComponent = ({ state, setState }) => {
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
        /*
        const email = data.email;
        if (!/@/.test(email) || !/\./.test(email) || !/com$/.test(email)) {
          toast.error('Por favor, ingrese un correo electrónico válido.', {
            autoClose: 3000,
          });
          return;
        }*/

        let response = await fetch(`http://localhost:4000/${route}`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          throw new Error('Network response was not OK');
        }
        response = await response.json();
        console.log(response);
        Cookies.set(
          'u',
          JSON.stringify({
            user_id: response.user_id,
            user_email: response.user_email,
            user_pass: response.user_pass,
            user_vault: response.user_vault,
          }),
          { expires: 7 }
        );
        Cookies.set(
          'v',
          JSON.stringify({
            vault_data: response.vault_data,
            vault_nonce: response.vault_nonce,
          }),
          { expires: 7 }
        );
        setState('Vault');

        toast.success('¡Éxito!', {
          autoClose: 3000, // Cerrar automáticamente después de 3 segundos
        });

        toast.success('¡Éxito!', {
          autoClose: 3000,
        });

    
        setPhoneAlertShown(false);

      } catch (error) {
        console.error(
          'There has been a problem with your fetch operation:',
          error
        );

        toast.error('Se ha producido un error.', {
          autoClose: 3000, // Cerrar automáticamente después de 3 segundos
        });
      }
    };


    const CustomToastCloseButton = ({ closeToast }) => (
      <button onClick={closeToast} className="custom-toast-close-button">
        OK
      </button>
    );
    return (
      <div className="form">
        <h1>{state}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-container">
            <input
              placeholder={'email'}
              {...register('email', { required: true, maxLength: 40 })}
              className="input-field"
            />
            <div className="input-icon">
              <FaEnvelope />
            </div>
          </div>


          <div className="input-container">
          
          <input
          
                placeholder={'password'}
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: true, maxLength: 20 })}
                
                
                onChange={(e) => {
                  setUserPassword(e.target.value);
                  handlePasswordChange(e); 
                }}
                
              />
              
            
            <div className="input-icon">
              <div className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEye  /> : <FaEyeSlash/>}
              </div>
            </div>
          </div>

          {!isPasswordEmpty && (
          <PasswordStrengthBar password={userPassword} barColors={['#00000000','#ff0000', '#ffa500', '#ffff00', '#00ff00','#00ff00']} />
          )}


          

          {state == 'Register' && (
            <>


            <div className="input-container">
            <input
                placeholder={'phone'}
                {...register('phone', { required: true, maxLength: 20 })}
                onKeyPress={handlePhoneKeyPress}
              />
            <div className="input-icon">
              <FaPhone />
            </div>
          </div>
             

            <div className="input-container">
            <input
                placeholder="master password"
                type={showPassword ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  handleMasterPasswordChange(e); 
                }}
            />
            <div className="input-icon">
              <div className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEye  /> : <FaEyeSlash/>}
              </div>
            </div>
          </div>

          {!isMasterPasswordEmpty && (
          <PasswordStrengthBar password={masterPassword} barColors={['#00000000','#ff0000', '#ffa500', '#ffff00', '#00ff00','#00ff00']} />
          )}

          <div className="color-picker-container">
              <label>Color Picker</label>
              <SketchPicker
                color={selectedColor}
                //onChange={(color) => setSelectedColor(color.hex)}
              />
            </div>

            
          </>

          )}
          <h3
            style={{ cursor: 'pointer' }}
            onClick={() => setState(state == 'Register' ? 'Login' : 'Register')}
          >
            {state == 'Register' ? 'Login?' : 'Register?'}
          </h3>
          <input type="submit" />
        </form>
        <ToastContainer
        transition={Slide}
        closeButton={<CustomToastCloseButton />}
      />

        <div className="help-icon-container">
          <FaQuestionCircle className="help-icon" />
        </div>

      </div>
    );
  };

  export default FormComponent;
