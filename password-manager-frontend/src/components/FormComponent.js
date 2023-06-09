import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';

const FormComponent = ({ state, setState }) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data) => {
    try {
      const route = state == 'Register' ? 'createuser' : 'loginuser';
      let response = await fetch(`http://localhost:4000/${route}`, {
        method: 'POST',
        body: JSON.stringify(data),
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
        }),
        { expires: 7 }
      );
      Cookies.set(
        'v',
        JSON.stringify({
          vault_data: response.vault_data,
        }),
        { expires: 7 }
      );
      setState('Vault');
    } catch (error) {
      console.error(
        'There has been a problem with your fetch operation:',
        error
      );
    }
  };
  return (
    <div className="form">
      <h1>{state}</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder={'email'}
          {...register('email', { required: true, maxLength: 40 })}
        />
        <input
          placeholder={'password'}
          {...register('password', { required: true, maxLength: 20 })}
        />
        {state == 'Register' && (
          <input
            placeholder={'phone'}
            {...register('phone', { required: true, maxLength: 20 })}
          />
        )}
        <h3
          style={{ cursor: 'pointer' }}
          onClick={() => setState(state == 'Register' ? 'Login' : 'Register')}
        >
          {state == 'Register' ? 'Login?' : 'Register?'}
        </h3>
        <input type="submit" />
      </form>
    </div>
  );
};

export default FormComponent;
