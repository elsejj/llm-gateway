import { ProviderConfigs } from '../types';
import { QWEN } from '../../globals';
import QWenAPIConfig from './api';
import { chatCompleteParams, responseTransformers } from '../open-ai-base';

const QWenConfig: ProviderConfigs = {
  chatComplete: chatCompleteParams([], { model: 'qwen-plus' }),
  api: QWenAPIConfig,
  responseTransforms: responseTransformers(QWEN, {
    chatComplete: true,
  }),
};

export default QWenConfig;
