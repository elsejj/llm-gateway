import { ProviderConfigs } from '../types';
import { DEEPSEEK } from '../../globals';
import { chatCompleteParams, responseTransformers } from '../open-ai-base';
import DeepSeekAPIConfig from './api';
import { Params, Message } from '../../types/requestBody';

const DeepSeekConfig: ProviderConfigs = {
  chatComplete: chatCompleteParams(
    [],
    {
      model: 'deepseek-chat',
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
              // deepseek only supports string content
              message.content = message.content[0].text || '';
            }
            return message;
          });
        },
      },
    }
  ),
  api: DeepSeekAPIConfig,
  responseTransforms: responseTransformers(DEEPSEEK, {
    chatComplete: true,
  }),
};

export default DeepSeekConfig;
