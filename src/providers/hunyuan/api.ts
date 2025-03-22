import { ProviderAPIConfig } from '../types';

const HunYuanAPIConfig: ProviderAPIConfig = {
  getBaseURL: () => 'https://api.hunyuan.cloud.tencent.com/v1',
  headers: ({ providerOptions }) => {
    return { Authorization: `Bearer ${providerOptions.apiKey}` }; // https://platform.deepseek.com/api_keys
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

export default HunYuanAPIConfig;
