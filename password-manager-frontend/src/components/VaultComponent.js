import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import {
  arrayBufferToBase64,
  decryptVault,
  encryptVault,
  generateMasterPassword,
} from '@/utils/crypto';
import { BallTriangle } from 'react-loader-spinner';

const VaultComponent = ({ vault, user }) => {
  const [validMP, setValidMP] = useState();
  const [creatingVault, setCreatingVault] = useState();
  const [loader, setLoader] = useState(true);
  const [showPromp, setShowPromp] = useState(true);
  const [editedIndex, setEditedIndex] = useState(null); // Estado para realizar un seguimiento del índice de elemento editado

  // const [master_password, setMasterPassword] = useState();

  const handleLogout = () => {
    // Eliminar las cookies de usuario y vault
    console.log('Se elimianron la cookies');
    Cookies.remove('u');
    Cookies.remove('v');

    // Recargar la página
    location.reload();
  };

  useEffect(() => {
    if (user) {
      setCreatingVault(user.user_vault);
      if (!user.user_vault) {
        setValidMP(generateMasterPassword(user.user_email, user.user_pass));
      }
    }
  }, [user]);
  useEffect(() => {
    console.log(vault);
  }, [vault]);

  const onSubmit = async (data) => {
    try {
      // const master_password = generateMasterPassword(
      //   user.email,
      //   user.user_pass
      // );
      let nonce_ = '';
      const vault_ = JSON.parse(Cookies.get('v'));

      if (vault_.vault_nonce != '') {
        nonce_ = vault_.vault_nonce;
      } else
        nonce_ = arrayBufferToBase64(
          crypto.getRandomValues(new Uint8Array(12))
        );
      // console.log('nonce', nonce_);
      // console.log('validMP', validMP);

      const { encrypted, nonce, mac } = await encryptVault(
        JSON.stringify(data.vault),
        // master_password
        validMP,
        nonce_
      );

      console.log('mp', validMP, 'nonce', nonce_);
      let response = await fetch('http://localhost:4000/updatevault', {
        method: 'PUT',
        body: JSON.stringify({
          data: encrypted,
          user_id: JSON.parse(Cookies.get('u')).user_id,
          nonce: nonce,
          mac: mac,
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      response = await response.json();
      Cookies.remove('v');
      Cookies.set(
        'v',
        JSON.stringify({
          vault_data: encrypted,
          vault_nonce: nonce,
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
          user_pass: user_.user_pass,
          user_vault: true,
        }),
        { expires: 7 }
      );
      //se creo vault
    } catch (error) {
      console.error(
        'There has been a problem with your fetch operation:',
        error
      );
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
    setValidMP(value);
  };
  const checkDecrypt = async () => {
    try {
      const vault_ = JSON.parse(Cookies.get('v'));
      console.log('VD', vault_.vault_data);
      console.log('VMP', validMP);
      console.log('Nonce', vault_.vault_nonce);

      const plaintext = await decryptVault(
        vault_.vault_data,
        validMP,
        vault_.vault_nonce
      );
      console.log(JSON.parse(plaintext));
      JSON.parse(plaintext).map((ele, idx) => {
        append({
          url: ele.url,
          username: ele.username,
          password: ele.password,
        });
      });
      setShowPromp(false);
    } catch (error) {
      console.log('Wrong master password', error);
    }
  };

  const handleEdit = (index) => {
    setEditedIndex(index); // Establecer el índice del elemento editado al hacer clic en el botón "Editar"
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
          {!creatingVault && (
            <div>
              <button onClick={() => setCreatingVault(true)}>
                Create vault
              </button>
            </div>
          )}
          {creatingVault && (
            <div>
              {showPromp && vault.length > 0 ? (
                <div style={{ backgroundColor: 'white', width: '400px' }}>
                  <input
                    placeholder="Enter your master password"
                    onChange={(e) => handleInputChange(e)}
                  ></input>
                  <div
                    id="EnterPass"
                    style={{ cursor: 'pointer' }}
                    onClick={() => checkDecrypt()}
                  >
                    Enter
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  style={{ backgroundColor: 'white', color: 'black' }}
                >
                  <div style={{ height: '400px', overflowY: 'auto' }}>
                    <ul>
                      {fields.map((field, index) => (
                        <li key={field.id}>
                          <div className={'vault'}>
                            <div>
                              <label htmlFor={'url'}>url</label>
                              <input
                                type={'url'}
                                placeholder={'url'}
                                {...register(`vault.${index}.url`, {
                                  required: 'url is required',
                                  maxLength: 40,
                                })}
                              />
                              {!editedIndex && (
                                <div
                                  className="button2"
                                  onClick={() => handleEdit(index)}
                                >
                                  Editar
                                </div>
                              )}


                              {editedIndex === index && (
                                <div
                                  className="button2"
                                  onClick={() => remove(index)}
                                >
                                  Eliminar
                                </div>
                              )}
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
                                type="password"
                                placeholder={'password'}
                                {...register(`vault.${index}.password`, {
                                  required: 'password is required',
                                  maxLength: 40,
                                })}
                              />
                            </div>
                            <div
                              className="button2"
                              onClick={() => remove(index)}
                            >
                              Delete
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="button-container">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        append({ url: '', username: '', password: '' });
                      }}
                    >
                      Add
                    </button>
                    <button type="submit">Save vault</button>
                    <button type="submit"> Edit </button>

                  </div>
                  <div className="logout-container">
                    <button onClick={() => handleLogout()}>Log Out</button>
                  </div>
  
                  <div className="username-container">
                    {user && (
                      <span className="username">
                        Welcome, {user.user_email}!
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VaultComponent;
