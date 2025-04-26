import { ProviderAPIConfig } from '../types';

const BaiduBceAPIConfig: ProviderAPIConfig = {
  getBaseURL: () => 'https://qianfan.baidubce.com/v2',
  headers: ({ providerOptions }) => {
    return { Authorization: `Bearer ${providerOptions.apiKey}` };
  },
  getEndpoint: ({ fn }) => {
    switch (fn) {
      case 'chatComplete':
        return '/chat/completions';
      default:
        return '';
    }
  },
};

export default BaiduBceAPIConfig;
