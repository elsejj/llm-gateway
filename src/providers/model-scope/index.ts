import { ProviderConfigs } from '../types';
import { MODEL_SCOPE } from '../../globals';
import ModelScopeAPIConfig from './api';
import { chatCompleteParams, responseTransformers } from '../open-ai-base';

const ModelScopeConfig: ProviderConfigs = {
  chatComplete: chatCompleteParams([], { model: 'Qwen/Qwen3-480B-A35B-Instruct' }),
  api: ModelScopeAPIConfig,
  responseTransforms: responseTransformers(MODEL_SCOPE, {
    chatComplete: true,
  }),
};

export default ModelScopeConfig;
