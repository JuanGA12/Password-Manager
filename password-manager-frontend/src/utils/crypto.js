import pbkdf2 from 'crypto-js/pbkdf2';
import lib from 'crypto-js/lib-typedarrays';
import SHA256 from 'crypto-js/sha256';

export const hashPassword = (password) => SHA256(password).toString();
export const generateMasterPassword = (email, password) => {
  const salt = lib.random(128 / 8);
  return pbkdf2(`${email}:${password}`, salt, {
    keySize: 128 / 32,
  }).toString();
};
const importKey = async (master_password) => {
  return await crypto.subtle.importKey(
    'raw',
    Buffer.from(master_password, 'utf-8'),
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
};
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  let bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};
export const encryptVault = async (plaintext, master_password) => {
  // import key from pbkdf2 password
  const master_password_key = await importKey(master_password);
  // create nonce
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  // encode plaintext
  const plaintextEncoded = new TextEncoder().encode(plaintext);
  // encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    master_password_key,
    plaintextEncoded
  );
  //   const [value, auth_tag] = [
  //     encrypted.slice(0, encrypted.byteLength - 16),
  //     encrypted.slice(encrypted.byteLength - 16),
  //   ];
  //   const decoder = new TextDecoder();
  //   const text = decoder.decode(value);
  //   const text2 = decoder.decode(auth_tag);
  //   //   console.log(text);
  //   console.log(auth_tag);

  // Buffer to base 64
  const binary = arrayBufferToBase64(encrypted);
  console.log('bin', binary);
  console.log('non', arrayBufferToBase64(nonce));
  return { encrypted: binary, nonce: arrayBufferToBase64(nonce) };
};

export const decryptVault = async (ciphertext, key, nonce) => {
  // import key from pbkdf2 password
  console.table(ciphertext, key, nonce);
  const master_password_key = await importKey(key);
  // base64 to buffer
  const chipertextBuffer = base64ToArrayBuffer(ciphertext);
  const nonceBuffer = base64ToArrayBuffer(nonce);
  // decrypt
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonceBuffer,
    },
    master_password_key,
    chipertextBuffer
  );
  // decode
  const text = new TextDecoder().decode(plaintext);
  return text;
};
