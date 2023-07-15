import pbkdf2 from 'crypto-js/pbkdf2';
import lib from 'crypto-js/lib-typedarrays';
import { useEffect, useState } from 'react';

export const decoder = new TextDecoder("utf-8");




export const generateMasterPassword = (password, color, email) => {
  return pbkdf2(`${password}:${color}`, email, {
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
export const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64) => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  let bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};
export const encryptVault = async (plaintext, master_password, nonce) => {
  // import key from pbkdf2 password
  const master_password_key = await importKey(master_password);
  console.log('mpk', master_password_key);
  // create nonce
  // const nonce = crypto.getRandomValues(new Uint8Array(12)); //fijar nonce y si funciona
  nonce = base64ToArrayBuffer(nonce);
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
  const [value, auth_tag] = [
    encrypted.slice(0, encrypted.byteLength - 16),
    encrypted.slice(encrypted.byteLength - 16),
  ];

  // Buffer to base 64
  const binary = arrayBufferToBase64(encrypted);

  //const hola1 = base64ToArrayBuffer(binary).slice(base64ToArrayBuffer(binary).byteLength - 16)
  const hola1 = base64ToArrayBuffer(binary)
  const hola2 = base64ToArrayBuffer(arrayBufferToBase64(auth_tag))
  console.log(decoder.decode(new Uint8Array(hola1)))
  console.log(decoder.decode(new Uint8Array(hola2)))

  return {
    encrypted: binary,
    nonce: arrayBufferToBase64(nonce),
    mac: arrayBufferToBase64(auth_tag),
  };
};

export const decryptVault = async (ciphertext, key, nonce) => {
  // import key from pbkdf2 password
  // console.log(ciphertext, key, nonce);
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
