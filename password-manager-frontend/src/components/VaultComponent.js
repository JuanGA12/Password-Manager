import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { SketchPicker } from 'react-color';
import { ToastContainer, toast, Slide } from 'react-toastify';
import { FaEye, FaEyeSlash, FaEnvelope, FaPhone } from 'react-icons/fa';
import {
  base64ToArrayBuffer,
  arrayBufferToBase64,
  decryptVault,
  encryptVault,
  generateMasterPassword,
  decoder
} from '@/utils/crypto';
import { BallTriangle } from 'react-loader-spinner';

const VaultComponent = ({ vault, user }) => {
  const [selectedColor, setSelectedColor] = useState('#fff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [masterPassword, setMasterPassword] = useState();
  const [loader, setLoader] = useState(true);
  const [showPromp, setShowPromp] = useState(true);
  const [encryptedData, setencryptedData] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if(encryptedData != '')
    {
      localStorage.setItem('encryptedData_' + JSON.parse(Cookies.get('u')).user_id, encryptedData);
    }
    }, [encryptedData]);
  const CustomToastCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} className="custom-toast-close-button">
      OK
    </button>
  );

  const handleLogout = () => {
    Cookies.remove('u');
    Cookies.remove('v');
    location.reload();
  };

  useEffect(() => {
    console.log(vault);
  }, [vault]);

  const onSubmit = async (data) => {
    try {
      const vault_ = JSON.parse(Cookies.get('v'));
      const nonce_ = vault_.vault_nonce;

      const secret = generateMasterPassword(
        masterPassword,
        selectedColor,
        user.user_email
      );
      const { encrypted, nonce, mac } = await encryptVault(
        JSON.stringify(data.vault),
        secret,
        nonce_
      );
      setencryptedData(encrypted)
      
      console.log('mp', secret, 'nonce', nonce_);
      const response = await fetch('http://localhost:4000/updatevault', {
        method: 'PUT',
        body: JSON.stringify({
          data: encrypted,
          user_id: JSON.parse(Cookies.get('u')).user_id,
          nonce: nonce,
          mac: mac,
        }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        toast.error(responseData.message, {
          autoClose: 3000,
        });
        throw new Error(responseData.message);
      }

      Cookies.remove('v');
      Cookies.set(
        'v',
        JSON.stringify({
          vault_data: encrypted,
          vault_nonce: nonce,
          vault_mac: mac,
        }),
        { expires: 7 }
      );
      const user_ = JSON.parse(Cookies.get('u'));
      Cookies.remove('u');
      Cookies.set(
        'u',
        JSON.stringify({
          user_id: user_.user_id,
          user_email: user_.user_email,
          user_phone: user_.user_phone,
        }),
        { expires: 7 }
      );
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

  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      vault,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vault',
  });
  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, [1000]);
  }, [loader]);
  const handleInputChange = (e) => {
    const { value } = e.target;
    setMasterPassword(value);
  };
  const checkDecrypt = async () => {
    try {
      const secret = generateMasterPassword(
        masterPassword,
        selectedColor,
        user.user_email
      );
          
      var uid = JSON.parse(Cookies.get('u')).user_id
      let body = {user_id: uid}
      console.log(uid)
      console.log(body)
      const response = await fetch(`http://localhost:4000/getVault`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      var responsedata = await response.json()
      var bd_mac = responsedata.vault.mac
      bd_mac = base64ToArrayBuffer(bd_mac)
      //COMPARAR CON LOCALSTORAGE Y VERIFICAR INTEGRIDAD
      
      var local_vault = localStorage.getItem('encryptedData_' + uid)
      var local_mac = base64ToArrayBuffer(local_vault).slice(base64ToArrayBuffer(local_vault).byteLength - 16)
      bd_mac = decoder.decode(new Uint8Array(bd_mac))
      local_mac = decoder.decode(new Uint8Array(local_mac))
      if(bd_mac == local_mac)
      {
      const vault_ = JSON.parse(Cookies.get('v'));
      console.log('VD', vault_.vault_data);
      console.log('VMP', secret);
      console.log('Nonce', vault_.vault_nonce);

      const plaintext = await decryptVault(
        vault_.vault_data,
        secret,
        vault_.vault_nonce
      );
      console.log(plaintext);
      if (plaintext == '') {
        append({
          url: '',
          username: '',
          password: '',
        });
      }
      if (plaintext != '') {
        JSON.parse(plaintext).map((ele, idx) => {
          append({
            url: ele.url,
            username: ele.username,
            password: ele.password,
          });
        });
      }
      toast.success('Vault decrypted!', {
        autoClose: 3000,
      });
      setShowPromp(false);
    }
    else
    {
      console.log('HOLA');
      toast.error('Integrity error: there was corrupted data in the server, you will see the last stable version of your passwords.', {
        autoClose: 3000,
      });
      const vault_ = JSON.parse(Cookies.get('v'));
      console.log('VD', vault_.vault_data);
      console.log('VMP', secret);
      console.log('Nonce', vault_.vault_nonce);

      const plaintext = await decryptVault(
        localStorage.getItem('encryptedData_' + uid),
        secret,
        vault_.vault_nonce
      );
      console.log(plaintext);
      if (plaintext == '') {
        append({
          url: '',
          username: '',
          password: '',
        });
      }
      if (plaintext != '') {
        JSON.parse(plaintext).map((ele, idx) => {
          append({
            url: ele.url,
            username: ele.username,
            password: ele.password,
          });
        });
      }
      setShowPromp(false);
    }
    } catch (error) {
      console.log('Error decrypting vault', error);
      toast.error('Error decrypting vault', {
        autoClose: 3000,
      });
    }
  };

  return (
    <div>
      {loader && (
        <BallTriangle
          height={100}
          width={100}
          radius={5}
          color="#ec5990"
          ariaLabel="ball-triangle-loading"
          wrapperClass={{}}
          wrapperStyle=""
          visible={true}
        />
      )}
      {!loader && (
        <div>
          {showPromp && vault.length > 0 ? (
            <div style={{ backgroundColor: 'white', width: '400px' }}>
              <div className='input-container'>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your master password"
                onChange={(e) => handleInputChange(e)}
              ></input>
              <div className="input-icon">
                    <div
                      className="password-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </div>
                  </div>
                </div>
              <div className="color-picker-container">
                <label>Selecciona tu color</label>
                <div
                  style={{
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                    marginBottom: '1rem',
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
                {showColorPicker && (
                  <SketchPicker
                    color={selectedColor}
                    onChange={(color) => setSelectedColor(color.hex)}
                  />
                )}
              </div>
              <div
                id="EnterPass"
                style={{ cursor: 'pointer' }}
                onClick={() => checkDecrypt()}
              >
                Enter
              </div>
            </div>
          ) : (
            <>
              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{
                  backgroundColor: 'white',
                  color: 'black',
                  width: '800px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  borderRadius: '10px',
                }}
              >
                {fields.map((field, index) => {
                  return (
                    <div key={field.id} className={'vault'}>
                      <div>
                        <label htmlFor={'url'}>Aplicación</label>
                        <input
                          placeholder={'Aplicación'}
                          {...register(`vault.${index}.url`, {
                            required: 'Aplicación is required',
                            maxLength: 40,
                          })}
                        />
                      </div>
                      <div>
                        <label htmlFor={'username'}>username</label>
                        <input
                          placeholder={'username'}
                          {...register(`vault.${index}.username`, {
                            required: 'username is required',
                            maxLength: 40,
                          })}
                        />
                      </div>
                      <div>
                        <label htmlFor={'password'}>password</label>
                        <input
                          // type="password"
                          placeholder={'password'}
                          {...register(`vault.${index}.password`, {
                            required: 'password is required',
                            maxLength: 40,
                          })}
                        />
                      </div>
                      <div className="button2" onClick={() => remove(index)}>
                        Delete
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', width: '500px' }}>
                  <button
                    style={{ marginRight: '10px' }}
                    onClick={(e) => {
                      e.preventDefault();
                      append({ url: '', username: '', password: '' });
                    }}
                  >
                    Add
                  </button>
                  <button style={{ marginLeft: '10px' }} type="submit">
                    Save vault
                  </button>
                </div>
              </form>
              <div className="logout-container">
                <button onClick={() => handleLogout()}>Log Out</button>
              </div>
              <div className="username-container">
                {user && (
                  <span className="username">Welcome, {user.user_email}!</span>
                )}
              </div>
            </>
          )}
        </div>
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

export default VaultComponent;
