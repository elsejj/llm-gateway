import { DEEPSEEK } from '../../globals';
import { Params } from '../../types/requestBody';

import {
  ChatCompletionResponse,
  ErrorResponse,
  ProviderConfig,
} from '../types';
import {
  generateErrorResponse,
  generateInvalidProviderResponseError,
  transformFinishReason,
} from '../utils';
import { DEEPSEEK_STOP_REASON } from './types';

export const DeepSeekChatCompleteConfig: ProviderConfig = {
  model: {
    param: 'model',
    required: true,
    default: 'deepseek-chat',
  },
  messages: {
    param: 'messages',
    default: '',
    transform: (params: Params) => {
      return params.messages?.map((message) => {
        if (message.role === 'developer') return { ...message, role: 'system' };
        return message;
      });
    },
  },
  response_format: {
    param: 'response_format',
    default: null,
  },
  max_tokens: {
    param: 'max_tokens',
    default: 100,
    min: 0,
  },
  max_completion_tokens: {
    param: 'max_tokens',
    default: 100,
    min: 0,
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
  tools: {
    param: 'tools',
    default: null,
  },
};

interface DeepSeekChatCompleteResponse extends ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: 'deepseek-chat' | 'deepseek-coder';
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekErrorResponse {
  object: string;
  message: string;
  type: string;
  param: string | null;
  code: string;
}

interface DeepSeekStreamChunk {
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

export const DeepSeekChatCompleteResponseTransform: (
  response: DeepSeekChatCompleteResponse | DeepSeekErrorResponse,
  responseStatus: number,
  responseHeaders: Headers,
  strictOpenAiCompliance: boolean
) => ChatCompletionResponse | ErrorResponse = (
  response,
  responseStatus,
  _responseHeaders,
  strictOpenAiCompliance
) => {
  if ('message' in response && responseStatus !== 200) {
    return generateErrorResponse(
      {
        message: response.message,
        type: response.type,
        param: response.param,
        code: response.code,
      },
      DEEPSEEK
    );
  }

  if ('choices' in response) {
    return {
      id: response.id,
      object: response.object,
      created: response.created,
      model: response.model,
      provider: DEEPSEEK,
      choices: response.choices.map((c) => ({
        index: c.index,
        message: {
          role: c.message.role,
          content: c.message.content,
        },
        finish_reason: transformFinishReason(
          c.finish_reason as DEEPSEEK_STOP_REASON,
          strictOpenAiCompliance
        ),
      })),
      usage: {
        prompt_tokens: response.usage?.prompt_tokens,
        completion_tokens: response.usage?.completion_tokens,
        total_tokens: response.usage?.total_tokens,
      },
    };
  }

  return generateInvalidProviderResponseError(response, DEEPSEEK);
};

export const DeepSeekChatCompleteStreamChunkTransform: (
  response: string,
  fallbackId: string,
  streamState: any,
  strictOpenAiCompliance: boolean,
  gatewayRequest: Params
) => string | string[] = (
  responseChunk,
  fallbackId,
  _streamState,
  strictOpenAiCompliance,
  _gatewayRequest
) => {
  let chunk = responseChunk.trim();
  chunk = chunk.replace(/^data: /, '');
  chunk = chunk.trim();
  if (chunk === '[DONE]') {
    return `data: ${chunk}\n\n`;
  }
  try {
    const parsedChunk: DeepSeekStreamChunk = JSON.parse(chunk);
    return (
      `data: ${JSON.stringify({
        id: parsedChunk.id,
        object: parsedChunk.object,
        created: parsedChunk.created,
        model: parsedChunk.model,
        provider: DEEPSEEK,
        choices: parsedChunk.choices?.map((c) => {
          return {
            index: c.index,
            delta: c.delta,
            finish_reason: c.finish_reason,
          };
        }),
        usage: parsedChunk.usage,
      })}` + '\n\n'
    );
  } catch (e) {
    console.warn('Failed to parse chunk ', chunk);
    return `data: ${chunk}\n\n`;
  }
};
