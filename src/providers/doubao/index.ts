import { ProviderConfigs } from '../types';
import DouBaoAPIConfig from './api';
import {
  DouBaoChatCompleteConfig,
  DouBaoChatCompleteResponseTransform,
  DouBaoChatCompleteStreamChunkTransform,
} from './chatComplete';

const DouBaoConfig: ProviderConfigs = {
  chatComplete: DouBaoChatCompleteConfig,
  api: DouBaoAPIConfig,
  responseTransforms: {
    chatComplete: DouBaoChatCompleteResponseTransform,
    'stream-chatComplete': DouBaoChatCompleteStreamChunkTransform,
  },
};

export default DouBaoConfig;
