import { Context } from 'hono';
import { HEADER_KEYS, POWERED_BY } from '../../globals';
import { verifyApiKey } from './verifyApiKey';
import { setHeaderByKeyStore } from './store';

const API_KEY_NAME = `x-${POWERED_BY}-api-key`;

export const keyStore = () => {
  return async (c: Context, next: any) => {
    const reqHeaders = c.req.raw.headers;

    const apiKey = reqHeaders.get(API_KEY_NAME);
    if (!(await verifyApiKey(apiKey))) {
      return new Response(null, { status: 401, headers: {} });
    }

    const authorization = reqHeaders.get('authorization');
    if (authorization === 'Bearer __KEYSTORE__') {
      if (!setHeaderByKeyStore(reqHeaders)) {
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
