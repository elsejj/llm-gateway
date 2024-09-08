import { boolean } from 'zod';
import { QWEN } from '../../globals';

import {
  ChatCompletionResponse,
  ErrorResponse,
  ProviderConfig,
} from '../types';
import {
  generateErrorResponse,
  generateInvalidProviderResponseError,
} from '../utils';

export const QWenChatCompleteConfig: ProviderConfig = {
  model: {
    param: 'model',
    required: true,
    default: 'qwen-plus',
  },
  messages: {
    param: 'messages',
    default: '',
  },
  max_tokens: {
    param: 'max_tokens',
    default: 100,
    min: 1,
    max: 2000,
    transform: (value: number) => {
      return Math.min(value, 2000);
    },
  },
  temperature: {
    param: 'temperature',
    default: 1,
    min: 0,
    max: 2,
  },
  top_p: {
    param: 'top_p',
    default: 1,
    min: 0,
    max: 1,
  },
  stream: {
    param: 'stream',
    default: false,
  },
  stream_options: {
    param: 'stream_options',
    default: null,
  },
  frequency_penalty: {
    param: 'frequency_penalty',
    default: 0,
    min: -2,
    max: 2,
  },
  presence_penalty: {
    param: 'presence_penalty',
    default: 0,
    min: -2,
    max: 2,
  },
  stop: {
    param: 'stop',
    default: null,
  },
  logprobs: {
    param: 'logprobs',
    default: false,
  },
  top_logprobs: {
    param: 'top_logprobs',
    default: 0,
    min: 0,
    max: 20,
  },
};

interface QWenChatCompleteResponse extends ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: 'qwen-plus' | 'qwen-max' | 'qwen-turbo' | 'qwen-long';
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface QWenErrorResponse {
  object: string;
  message: string;
  type: string;
  param: string | null;
  code: string;
}

interface QWenStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      role?: string | null;
      content?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const QWenChatCompleteResponseTransform: (
  response: QWenChatCompleteResponse | QWenErrorResponse,
  responseStatus: number
) => ChatCompletionResponse | ErrorResponse = (response, responseStatus) => {
  if ('message' in response && responseStatus !== 200) {
    return generateErrorResponse(
      {
        message: response.message,
        type: response.type,
        param: response.param,
        code: response.code,
      },
      QWEN
    );
  }

  if ('choices' in response) {
    return {
      id: response.id,
      object: response.object,
      created: response.created,
      model: response.model,
      provider: QWEN,
      choices: response.choices.map((c) => ({
        index: c.index,
        message: {
          role: c.message.role,
          content: c.message.content,
        },
        finish_reason: c.finish_reason,
      })),
      usage: {
        prompt_tokens: response.usage?.prompt_tokens,
        completion_tokens: response.usage?.completion_tokens,
        total_tokens: response.usage?.total_tokens,
      },
    };
  }

  return generateInvalidProviderResponseError(response, QWEN);
};

export const QWenChatCompleteStreamChunkTransform: (
  response: string
) => string = (responseChunk) => {
  let chunk = responseChunk.trim();
  chunk = chunk.replace(/^data: /, '');
  chunk = chunk.trim();
  if (chunk === '[DONE]') {
    return `data: ${chunk}\n\n`;
  }
  const parsedChunk: QWenStreamChunk = JSON.parse(chunk);
  return (
    `data: ${JSON.stringify({
      id: parsedChunk.id,
      object: parsedChunk.object,
      created: parsedChunk.created,
      model: parsedChunk.model,
      provider: QWEN,
      choices: parsedChunk.choices?.slice(0, 1).map((c) => {
        return {
          index: c.index,
          delta: c.delta,
          finish_reason: c.finish_reason,
        };
      }),
      usage: parsedChunk.usage,
    })}` + '\n\n'
  );
};
