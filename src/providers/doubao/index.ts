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
    }
  ),
  api: DouBaoAPIConfig,
  responseTransforms: responseTransformers(DOUBAO, {
    chatComplete: true,
  }),
};

export default DouBaoConfig;
