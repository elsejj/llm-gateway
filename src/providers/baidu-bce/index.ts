import { ProviderConfigs } from '../types';
import { BAIDU_BCE } from '../../globals';
import { chatCompleteParams, responseTransformers } from '../open-ai-base';
import BaiduBceAPIConfig from './api';
//import { Params, Message } from '../../types/requestBody';

const BaiduBceConfig: ProviderConfigs = {
  chatComplete: chatCompleteParams([], {
    model: 'ernie-4.5-turbo-32k',
  }),
  api: BaiduBceAPIConfig,
  responseTransforms: responseTransformers(BAIDU_BCE, {
    chatComplete: true,
  }),
};

export default BaiduBceConfig;
