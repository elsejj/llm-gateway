type ApiKey = {
  header: string;
  version: number;
  expireAt: number;
};

/**
 * decode api key from buffer
 *
 * the api key format is:
 * - 2 bytes header: 'JJ'
 * - 2 bytes version: 1
 * - 4 bytes expireAt: unix timestamp
 *
 * @param apiKey plain api key buffer
 * @returns  decoded api key
 */
function decodeApiKey(apiKey: Buffer): ApiKey {
  if (apiKey.length < 4) {
    throw new Error('Invalid api key');
  }
  const header = apiKey.subarray(0, 2).toString('utf8');
  if (header !== 'JJ') {
    throw new Error('Invalid api key');
  }
  const version = apiKey.readUInt16LE(2);
  switch (version) {
    case 1:
      if (apiKey.length < 8) {
        throw new Error('Invalid api key');
      }
      const expireAt = apiKey.readUInt32LE(4);
      return { header, version, expireAt };
    default:
      throw new Error('Unsupported api key version');
  }
}

/**
 * make api key buffer
 *
 * @param version api key version
 * @param expireAt expire at unix timestamp
 * @returns api key buffer
 */
function makeApiKeyV1(version: number, expireAt: number): Buffer {
  const apiKey = Buffer.alloc(8);
  apiKey.write('JJ', 0, 2, 'utf8');
  apiKey.writeUInt16LE(version, 2);
  apiKey.writeUInt32LE(expireAt, 4);
  return apiKey;
}

/**
 * decrypt api key with master key
 *
 * @param apiKey encrypted api key
 * @param masterKey master key
 * @returns decrypted api key
 * @throws error if api key is invalid
 */
export async function decryptApiKey(
  apiKey: string,
  masterKey: string
): Promise<ApiKey> {
  const apiKeyBuf = Buffer.from(apiKey, 'base64');
  if (apiKeyBuf.length < 16) {
    throw new Error('Invalid api key');
  }

  const hashedMasterKey = Buffer.from(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(masterKey))
  );
  const iv = new Uint8Array(16);
  iv.set(apiKeyBuf.subarray(0, 8), 0);
  for (let i = 0; i < 8; i++) {
    iv[i + 8] = apiKeyBuf[i] ^ hashedMasterKey[i];
  }
  const key = await crypto.subtle.importKey(
    'raw',
    hashedMasterKey.subarray(16),
    'AES-GCM',
    false,
    ['decrypt']
  );
  // do aes decrypt to apiKey with master key
  const decryptedApiKey = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    apiKeyBuf.subarray(8)
  );

  return decodeApiKey(Buffer.from(decryptedApiKey));
}

/**
 * generate api key with master key
 *
 * the encrypted api key format is:
 * - 8 bytes iv
 * - encrypted api key
 *
 * the encrypt logic is:
 * - create a 16 bytes iv
 * - first 8 bytes of iv is random
 * - fill the rest of iv with hashed master key xor with first 8 bytes of iv
 * - use the half of hashed master key as aes key
 * - use aes-gcm to encrypt api key
 *
 * @param expireDuration
 * @param masterKey
 * @returns
 */
export async function generateApiKey(
  expireDuration: number,
  masterKey: string
): Promise<string> {
  const expireAt = Math.floor(Date.now() / 1000) + expireDuration;
  const apiKey = makeApiKeyV1(1, expireAt);
  const hashedMasterKey = Buffer.from(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(masterKey))
  );
  const ivBase = crypto.getRandomValues(new Uint8Array(8));
  const iv = new Uint8Array(16);
  iv.set(ivBase, 0);
  for (let i = 0; i < 8; i++) {
    iv[i + 8] = ivBase[i] ^ hashedMasterKey[i];
  }
  const key = await crypto.subtle.importKey(
    'raw',
    hashedMasterKey.slice(16),
    'AES-GCM',
    false,
    ['encrypt']
  );
  // do aes encrypt to apiKey with master key
  const encryptedApiKey = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    apiKey
  );
  const encryptedApiKeyBuf = new Buffer(8 + encryptedApiKey.byteLength);
  encryptedApiKeyBuf.set(ivBase, 0);
  encryptedApiKeyBuf.set(Buffer.from(encryptedApiKey), 8);
  return encryptedApiKeyBuf.toString('base64');
}

/**
 * verify input api key is valid
 * @param apiKey
 * @returns api key is valid or not
 */
export async function verifyApiKey(apiKey: string | null): Promise<boolean> {
  try {
    const masterKey = process.env.LLM_GATEWAY_MASTER_KEY;
    if (!masterKey) {
      // if master key is not set, skip the verification
      return true;
    }
    if (!apiKey) {
      return false;
    }
    const parsedApiKey = await decryptApiKey(apiKey, masterKey);
    if (parsedApiKey.expireAt < Date.now() / 1000) {
      throw new Error('Api key expired');
    }
    return true;
  } catch (e) {
    console.error('verifyApiKey failed', e);
    return false;
  }
}
