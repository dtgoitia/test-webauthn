class Logger {
  constructor() {}

  info(message) {
    console.log(message);
    this._log(`[INF] ${message}`);
  }

  error(message) {
    console.error(message);
    this._log(`[ERR] ${message}`);
  }

  _log(message) {
    const now = new Date().toISOString().slice(11, -1);
    const datedMessage = `${now} ${message}`;

    const log = document.createElement("code");
    log.innerText = datedMessage;
    const logContainer = document.createElement("div");
    logContainer.appendChild(log);

    const logs = document.getElementById("logs");
    logs.appendChild(logContainer);
  }
}

const logger = new Logger();

const RAWID_LOCALSTORAGE_KEY = "test-credentials-rawid";

const RELAYING_PARTY_ID = "beltz.dtgoitia.dev";                    // TODO: must match frontend domain
const USER_ID = "some-random-string1";                             // must be unique per user
const CHALLENGE = Uint8Array.from((new Date()).toISOString().split("").map(c => c.charCodeAt(0)));   // must be single-use value

/**
 * `rawId` is an `ArrayBuffer`
 * to store it in LocalStore must be first converted to a string:
 * 
 *    1. ArrayBuffer -> Uint8Array:   new Uint8Array(rawId)
 *    2. Uint8Array  -> string:       String.fromCharCode(...uint8Array)
 * 
 * The string representation of `PublicKeyCredential.rawId` must match the
 * `PublicKeyCredential.id` string obtained during the creation of the
 * credentials.
 */
function saveRawId(rawId) {
  const rawId_base64 = btoa(String.fromCharCode(...(new Uint8Array(rawId))));
  localStorage.setItem(RAWID_LOCALSTORAGE_KEY, rawId_base64);
}

async function createCredentials() {
  logger.info("createCredentials: starting");

  let credential;
  try {
    credential = await navigator.credentials.create({
      publicKey: {
        challenge: CHALLENGE,
        rp: {
          id: RELAYING_PARTY_ID,
          name: "ACME Corporation", // optional?
        },
        user: {
          id: Uint8Array.from(USER_ID, c => c.charCodeAt(0)),
          name: "jamiedoe@example.com",  // required
          displayName: "Jamie Doe",      // required
        },
        pubKeyCredParams: [{
          type: "public-key",
          alg: -7,  // Elliptic Curve with SHA-S256 signature
        }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",  // force biometrics
        },
        attestation: "direct",
      },
    });
  } catch (error) {
    logger.error(error);
  }

  logger.info(JSON.stringify(credential, null, 4));
  /*

  PublicKeyCredential {
    id: "AeqASQXZ-L9pTchRqCb0fegBR6rYlkFdyFoaGcJ2EjcnOhUY_QUmD5CBbRsq0dtmq4d6jVNQf74KJGTgTmcLRKk",
    rawId: ArrayBuffer(59),
    response: AuthenticatorAttestationResponse {
      clientDataJSON: ArrayBuffer(121),
      attestationObject: ArrayBuffer(306),
    },
    type: "public-key",
  }

  where:
    .rawId : binary
    .id    : base64 string
    .response.atestationObject : contains public key and other metadata - encoded in CBOR
  */
  logger.info("createCredentials: done");
  return credential;
}

async function getCredentials() {
  logger.info("getCredentials: starting");

  const rawId_base64 = localStorage.getItem(RAWID_LOCALSTORAGE_KEY);
  if (rawId_base64 === null) {
    logger.info(`getCredentials: no rawId found in LocalStorage`);
    return
  }
  logger.info(`getCredentials: rawId found in LocalStorage: ${rawId_base64}`);

  let credentials;
  try {
    credentials = await navigator.credentials.get({
      publicKey: {
        challenge: CHALLENGE,
        rpId: RELAYING_PARTY_ID,
        allowCredentials: [{
          type: "public-key",
          id: Uint8Array.from(rawId_base64, c => c.charCodeAt(0)),
        }],
        userVerification: "required",
        timeout: 60000, // ms the user has to respond to the authentication prompt
      },
    });
    debugger;
  } catch (error) {
    logger.error(error);
    return
  }

  if (credentials === null) {
    logger.info("getCredentials: credentials = null");
    return
  }

  logger.info(JSON.stringify(credentials, null, 2));
  logger.info("getCredentials: done");
  return credentials;
}

async function main() {
  logger.info("main: starting");
  let credentials = await getCredentials()
  if (credentials) {
    logger.info("main: credentials found!");
    logger.info(JSON.stringify(credentials.response, null, 2));
    return
  }
  logger.info(`main: no credentials found`);

  return
  logger.info(`main: creating new credentials`);

  credentials = await createCredentials();
  if (credentials === undefined) {
    logger.error("main: credentials === undefined");
    return
  }

  localStorage.setItem(RAWID_LOCALSTORAGE_KEY, credentials.id);

  logger.info(JSON.stringify(credentials.response, null, 2));

  logger.info("main: done");
}

main();

/*

WIP check how the demos work for Firefox and Chrome:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#demo_sites

you probably want to implement your own library
*/



/**
 * Search for this:
 * supports, for example, authentication on a desktop computer using a smartphone.
 * 
 * here:
 * https://w3c.github.io/webauthn/#dom-publickeycredentialrequestoptions-allowcredentials
 */