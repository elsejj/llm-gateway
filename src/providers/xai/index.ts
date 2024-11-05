import { ProviderConfigs } from '../types';
import XAiAPIConfig from './api';
import {
  XAiChatCompleteConfig,
  XAiChatCompleteResponseTransform,
  XAiChatCompleteStreamChunkTransform,
} from './chatComplete';

const XAiConfig: ProviderConfigs = {
  chatComplete: XAiChatCompleteConfig,
  api: XAiAPIConfig,
  responseTransforms: {
    chatComplete: XAiChatCompleteResponseTransform,
    'stream-chatComplete': XAiChatCompleteStreamChunkTransform,
  },
};

export default XAiConfig;
