import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import {
  decryptVault,
  encryptVault,
  generateMasterPassword,
} from '@/utils/crypto';

const VaultComponent = ({ vault, user }) => {
  const [validMP, setValidMP] = useState(false);
  const [creatingVault, setCreatingVault] = useState(false);

  const onSubmit = async (data) => {
    // const master_password = generateMasterPassword(user.email, user.user_pass);
    // const { encrypted, nonce } = await encryptVault(
    //   JSON.stringify(data.vault),
    //   master_password
    // );
    // await decryptVault(encrypted, master_password, nonce);
    try {
      const master_password = generateMasterPassword(
        user.email,
        user.user_pass
      );
      const { encrypted, nonce } = await encryptVault(
        JSON.stringify(data.vault),
        master_password
      );
      const body = {
        data: encrypted,
        user_id: JSON.parse(Cookies.get('u')).user_id,
        nonce: nonce,
      };
      let response = await fetch('http://localhost:4000/updatevault', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      response = await response.json();
      console.log(response);
      // Cookies.set(
      //   'v',
      //   JSON.stringify({
      //     vault_data: response.vault_data,
      //   }),
      //   { expires: 7 }
      // );
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
  return (
    <div>
      <div>
        {!creatingVault && (
          <button onClick={() => setCreatingVault(true)}>Create vault</button>
        )}
        {
          creatingVault && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ backgroundColor: 'white', color: 'black' }}
            >
              {fields.map((field, index) => {
                return (
                  <div key={field.id} className={'vault'}>
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
                    <div className="button2" onClick={() => remove(index)}>
                      -
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex' }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    append({ url: '', username: '', password: '' });
                  }}
                >
                  Add
                </button>
                <button type="submit">Save vault</button>
              </div>
            </form>
          )
          // <button>
          //   Add
          // </button>
          // <form onSubmit={handleSubmit(onSubmit)}>
          //   <input
          //     placeholder={'pass'}
          //     {...register('url', { required: true, maxLength: 40 })}
          //   />
          //   <input type="submit" />
          // </form>
        }
      </div>

      {/* {vault[0] != '' && (
        <div className="form">
          {!validMP && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                placeholder={'Enter your master password'}
                {...register('master_password', {
                  required: true,
                  maxLength: 40,
                })}
              />
              <input type="submit" />
            </form>
          )}
          {validMP && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                placeholder={'pass'}
                {...register('master', { required: true, maxLength: 40 })}
              />
              <input type="submit" />
            </form>
          )}
        </div>
      )} */}
    </div>
  );
};

export default VaultComponent;
