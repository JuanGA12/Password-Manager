'use client';
import FormComponent from '@/components/FormComponent';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { BallTriangle } from 'react-loader-spinner';
import VaultComponent from '@/components/VaultComponent';

export default function Home() {
  const [state, setState] = useState('Login');
  const [loader, setLoader] = useState(true);

  const [user, setUser] = useState(null);
  const [vault, setVault] = useState([]);
  useEffect(() => {
    const user = Cookies.get('u');
    const vault = Cookies.get('v');
    if (user && vault) {
      setUser(JSON.parse(user));
      const data_vault = JSON.parse(vault).vault_data;
      setVault(data_vault == '' ? [] : data_vault);
      setState('Vault');
    } else setState('Login');
  }, [Cookies.get('u'), Cookies.get('v')]);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, [1000]);
  }, [loader]);
  return (
    <main>
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
          {(state == 'Login' || state == 'Register') && (
            <FormComponent state={state} setState={setState} />
          )}
          {state == 'Vault' && <VaultComponent vault={vault} user={user} />}
        </div>
      )}
    </main>
  );
}
