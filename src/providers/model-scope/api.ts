import { ProviderAPIConfig } from '../types';

const ModelScopeAPIConfig: ProviderAPIConfig = {
  getBaseURL: () => 'https://api-inference.modelscope.cn',
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

export default ModelScopeAPIConfig;
