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
      reasoning_effort: {
        param: 'reasoning_effort',
        default: null,
        transform: (params: Params) => {
          if (params?.reasoning_effort) {
            switch (params.reasoning_effort) {
              case 'none':
                return 'minimal';
              case 'low':
              case 'medium':
              case 'high':
                if (params.thinking?.type != 'enabled') {
                  //@ts-ignore, https://www.volcengine.com/docs/82379/1449737#0002
                  params.thinking = { type: 'enabled' };
                }
                return params.reasoning_effort;
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
