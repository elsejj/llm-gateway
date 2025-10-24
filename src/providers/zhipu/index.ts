import { ZHIPU } from '../../globals';
import { chatCompleteParams, responseTransformers } from '../open-ai-base';
import { ProviderConfigs } from '../types';
import ZhipuAPIConfig from './api';

const ZhipuConfig: ProviderConfigs = {
  chatComplete: chatCompleteParams([], { model: 'glm-4.5-flash' }),
  api: ZhipuAPIConfig,
  responseTransforms: responseTransformers(ZHIPU, {
    chatComplete: true,
  }),
};

export default ZhipuConfig;
