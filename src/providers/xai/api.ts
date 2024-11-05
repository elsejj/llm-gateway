import { ProviderAPIConfig } from '../types';

const XAiAPIConfig: ProviderAPIConfig = {
  getBaseURL: () => 'https://api.x.ai/v1',
  headers: ({ providerOptions }) => {
    return { Authorization: `Bearer ${providerOptions.apiKey}` }; // https://docs.x.ai/api#authentication
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

export default XAiAPIConfig;
