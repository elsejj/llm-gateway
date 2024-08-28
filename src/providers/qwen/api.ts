import { ProviderAPIConfig } from '../types';

const QWenAPIConfig: ProviderAPIConfig = {
  getBaseURL: () => 'https://dashscope.aliyuncs.com/compatible-mode',
  headers: ({ providerOptions }) => {
    return { Authorization: `Bearer ${providerOptions.apiKey}` }; // https://platform.deepseek.com/api_keys
  },
  getEndpoint: ({ fn }) => {
    switch (fn) {
      case 'chatComplete':
        return '/v1/chat/completions';
      default:
        return '';
    }
  },
};

export default QWenAPIConfig;
