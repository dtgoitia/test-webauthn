import { useEffect, useState } from 'react'
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import './App.css'

function App() {
  const [rawId, setRawId] = useState<string|undefined>();

  useEffect(() => {
    setRawId(localStorage.getItem('id') || undefined);
  })

  function register(): void {
    startRegistration({
      optionsJSON: {
        challenge: '1T6uHri4OAQ',
        attestation: 'direct',
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        rp: {
          id: 'beltz.dtgoitia.dev',
          name: 'SimpleWebAuthn',
        },
        user: {
          id: 'f4pdy3fpA35',
          displayName: 'displayName',
          name: 'username',
        },
        timeout: 60_000,
      }
    }).then((response) => {
      console.log(response);
      // setRawId(response.rawId);
      setRawId(response.id);
      localStorage.setItem('id', response.id);
    });
  }

  function auth(): void {
     const optionsJSON = {
        challenge: 'some-other-challenge',
        rpId: "beltz.dtgoitia.dev",
        timeout: 60_000,
      }

    startAuthentication({ optionsJSON }).then((response) => {
      console.log(response);
    });
  }

  return (
    <>
      <div>
        <code>rawId: {rawId === undefined ? 'undefined' : rawId}</code>
      </div>
      <div>
        <code>effectiveDomain: {window.location.hostname}</code>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={register}>
          register
        </button>
        <button onClick={auth}>
          authenticate
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
