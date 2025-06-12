// import { ProviderConfigs } from '../types';
// import DouBaoAPIConfig from './api';
// import {
//   DouBaoChatCompleteConfig,
//   DouBaoChatCompleteResponseTransform,
//   DouBaoChatCompleteStreamChunkTransform,
// } from './chatComplete';

// const DouBaoConfig: ProviderConfigs = {
//   chatComplete: DouBaoChatCompleteConfig,
//   api: DouBaoAPIConfig,
//   responseTransforms: {
//     chatComplete: DouBaoChatCompleteResponseTransform,
//     'stream-chatComplete': DouBaoChatCompleteStreamChunkTransform,
//   },
// };

// export default DouBaoConfig;

import { ProviderConfigs } from '../types';
import { DOUBAO } from '../../globals';
import { chatCompleteParams, responseTransformers } from '../open-ai-base';
import DouBaoAPIConfig from './api';
import { Params, Message } from '../../types/requestBody';

const DouBaoConfig: ProviderConfigs = {
  chatComplete: chatCompleteParams(
    [],
    {},
    {
      messages: {
        param: 'messages',
        default: '',
        transform: (params: Params) => {
          return params.messages?.map((message: Message) => {
            if (
              message.role === 'tool' &&
              Array.isArray(message.content) &&
              message.content.length > 0
            ) {
              // doubao only supports string content
              message.content = message.content[0].text || '';
            }
            return message;
          });
        },
      },
      reasoning_effort: {
        param: 'thinking',
        default: null,
        transform: (params: Params) => {
          if (params?.reasoning_effort) {
            switch (params.reasoning_effort) {
              case 'none':
                return { type: 'disabled' };
              case 'auto':
                return { type: 'auto' };
              default:
                return { type: 'enabled' };
            }
          }
          return null;
        },
      },
    }
  ),
  api: DouBaoAPIConfig,
  responseTransforms: responseTransformers(DOUBAO, {
    chatComplete: true,
  }),
};

export default DouBaoConfig;
