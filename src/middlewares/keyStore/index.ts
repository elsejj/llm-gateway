import { Context } from 'hono';
import { POWERED_BY } from '../../globals';
import { verifyApiKey } from './verifyApiKey';
import { setHeaderByKeyStore } from './store';

const API_KEY_NAME = `x-${POWERED_BY}-api-key`;

export const keyStore = () => {
  return async (c: Context, next: any) => {
    const reqHeaders = c.req.raw.headers;

    const apiKey =
      reqHeaders.get(API_KEY_NAME) ||
      reqHeaders.get('authorization')?.replace('Bearer ', '');
    const useKeyStore = await verifyApiKey(apiKey);
    if (useKeyStore) {
      let ok = false;
      const reqBody = await c.req.json();
      const model = reqBody.model;
      try {
        ok = setHeaderByKeyStore(reqHeaders, model);
      } catch (e) {
        console.error('setHeaderByKeyStore error', e);
      }
      if (!ok) {
        const msg = JSON.stringify({
          status: 'failure',
          message: `cannot set header from keystore`,
        });
        return new Response(msg, {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });
      }
    }
    return next();
  };
};
