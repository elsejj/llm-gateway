import { ProviderConfigs } from '../types';
import QWenAPIConfig from './api';
import {
  QWenChatCompleteConfig,
  QWenChatCompleteResponseTransform,
  QWenChatCompleteStreamChunkTransform,
} from './chatComplete';

const QWenConfig: ProviderConfigs = {
  chatComplete: QWenChatCompleteConfig,
  api: QWenAPIConfig,
  responseTransforms: {
    chatComplete: QWenChatCompleteResponseTransform,
    'stream-chatComplete': QWenChatCompleteStreamChunkTransform,
  },
};

export default QWenConfig;
