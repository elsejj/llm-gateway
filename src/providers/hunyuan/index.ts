import { ProviderConfigs } from '../types';
import { HUNYUAN } from '../../globals';
import { chatCompleteParams, responseTransformers } from '../open-ai-base';
import HunYuanAPIConfig from './api';
import { Params, Message } from '../../types/requestBody';

const HunYuanConfig: ProviderConfigs = {
  chatComplete: chatCompleteParams(
    [],
    {
      model: 'hunyuan-t1-latest',
    },
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
              // hunyuan only supports string content
              message.content = message.content[0].text || '';
            }
            return message;
          });
        },
      },
      tool_choice: {
        param: 'tool_choice',
        transform: (params: Params) => {
          if (params.tool_choice === 'required') {
            return undefined;
          } else {
            return undefined;
          }
        },
      },
    }
  ),
  api: HunYuanAPIConfig,
  responseTransforms: responseTransformers(HUNYUAN, {
    chatComplete: true,
  }),
};

export default HunYuanConfig;
