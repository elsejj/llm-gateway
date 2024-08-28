import exp from "constants";
import { decryptApiKey, generateApiKey } from "../../middlewares/keyStore/verifyApiKey";


test('key create/parse', async () => {
  const master = 'master';
  const expireDuration = 60 * 60 * 24;

  const apiKey1 = await generateApiKey(expireDuration, master);

  console.log(apiKey1);

  const apiKey2 = await decryptApiKey(apiKey1, master);

  console.log(apiKey2);

  expect(apiKey2.expireAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  expect(apiKey2.version).toBe(1);
  expect(apiKey2.header).toBe('JJ');
})