import fs from 'fs';
import path from 'path';
import {
  AZURE_OPEN_AI,
  BEDROCK,
  DOUBAO,
  GOOGLE_VERTEX_AI,
  HEADER_KEYS,
  POWERED_BY,
} from '../../globals';

const KEY_STORE_FILE = process.env.LLM_GATEWAY_KEY_STORE_FILE || 'llmkeys.json';

type KeyItem = {
  apiKey: string;
};

type AzureOpenAIKeyItem = {
  resourceName: string;
  deploymentId: string;
  apiVersion: string;
  modelName: string;
} & KeyItem;

type BedrockKeyItem = {
  accessKey: string;
  accessId: string;
  region: string;
} & KeyItem;

type VertexKeyItem = {
  region: string;
  projectId: string;
  serviceAccountJson: Record<string, any>;
} & KeyItem;

type DouBaoKeyItem = {
  apiKey: string;
  models: { [key: string]: string };
} & KeyItem;

type AllKeyItem = {
  'azure-openai': AzureOpenAIKeyItem[];
  bedrock: BedrockKeyItem[];
  'vertex-ai': VertexKeyItem[];
  doubao: DouBaoKeyItem[];
  [key: string]: KeyItem[];
};

class WithRoundRobin<T> {
  private items: T[];
  private index: number;

  constructor(items: T[]) {
    this.items = items;
    this.index = 0;
  }

  get next(): T | undefined {
    if (this.items.length === 0) {
      return undefined;
    }
    const item = this.items[this.index];
    this.index = (this.index + 1) % this.items.length;
    return item;
  }
}

type KeyStore = {
  'azure-openai': {
    [key: string]: WithRoundRobin<AzureOpenAIKeyItem>;
  };
  bedrock: WithRoundRobin<BedrockKeyItem>;
  'vertex-ai': WithRoundRobin<VertexKeyItem>;
  doubao: WithRoundRobin<DouBaoKeyItem>;
  [key: string]:
    | WithRoundRobin<KeyItem>
    | Record<string, WithRoundRobin<KeyItem>>;
};

let keyStore: KeyStore = {
  'azure-openai': {},
  bedrock: new WithRoundRobin([]),
  'vertex-ai': new WithRoundRobin([]),
  doubao: new WithRoundRobin([]),
};

function buildStore(key: string, data: any[]): any {
  switch (key) {
    case AZURE_OPEN_AI: {
      const v = data.reduce((acc, item) => {
        const found = acc[item.modelName];
        if (!found) {
          acc[item.modelName] = [item];
        } else {
          found.push(item);
        }
        return acc;
      }, {});
      const d: Record<string, WithRoundRobin<AzureOpenAIKeyItem>> = {};
      for (const modelName of Object.keys(v)) {
        d[modelName] = new WithRoundRobin(v[modelName]);
      }
      return d;
    }
    case BEDROCK:
    case GOOGLE_VERTEX_AI: {
      const d = data.flatMap((item) => {
        const regions = item.region as string;
        return regions.split(',').map((region) => {
          return { ...item, region };
        });
      });
      return new WithRoundRobin(d);
    }
    default:
      return new WithRoundRobin(data);
  }
}

function loadKeyStore(filename: string) {
  try {
    const body = fs.readFileSync(filename, 'utf8');
    const data = JSON.parse(body) as AllKeyItem;
    for (const key in data) {
      keyStore[key] = buildStore(key, data[key]);
    }
    console.log(`key store file ${filename} loaded`);
  } catch (e) {
    console.error(`cannot load key store file ${filename}: ${e}`);
  }
}

// get absolute path of key store file, and watch the file
const absKeyStoreFile = path.resolve(KEY_STORE_FILE);
const storeFileDir = path.dirname(absKeyStoreFile);
const storeFileName = path.basename(absKeyStoreFile);
fs.watch(storeFileDir, null, (event, filename) => {
  if (filename === storeFileName) {
    loadKeyStore(filename);
  }
});

loadKeyStore(absKeyStoreFile);

export function setHeaderByKeyStore(
  requestHeaders: Record<string, any>,
  modelRequest: string | undefined
): boolean {
  const provider = requestHeaders.get(HEADER_KEYS.PROVIDER);
  if (!provider) {
    return false;
  }

  const store = keyStore[provider];
  if (!store) {
    return false;
  }

  switch (provider) {
    case AZURE_OPEN_AI: {
      const modelName =
        modelRequest ||
        requestHeaders.get(`x-${POWERED_BY}-azure-model-name`) ||
        '';
      if (!modelName) {
        return false;
      }
      const azStore = store as {
        [key: string]: WithRoundRobin<AzureOpenAIKeyItem>;
      };
      const item = azStore[modelName]?.next;
      if (!item) {
        return false;
      }
      requestHeaders.set(
        `x-${POWERED_BY}-azure-resource-name`,
        item.resourceName
      );
      requestHeaders.set(
        `x-${POWERED_BY}-azure-deployment-id`,
        item.deploymentId
      );
      requestHeaders.set(`x-${POWERED_BY}-azure-api-version`, item.apiVersion);
      requestHeaders.set(`x-${POWERED_BY}-azure-model-name`, item.modelName);
      requestHeaders.set('authorization', `Bearer ${item.apiKey}`);
      return true;
    }
    case BEDROCK: {
      const item = store.next as BedrockKeyItem;
      if (!item) {
        return false;
      }
      requestHeaders.set(`x-${POWERED_BY}-aws-access-key-id`, item.accessId);
      requestHeaders.set(
        `x-${POWERED_BY}-aws-secret-access-key`,
        item.accessKey
      );
      requestHeaders.set(`x-${POWERED_BY}-aws-region`, item.region);
      requestHeaders.set('authorization', `Bearer ${item.apiKey || ''}`);
      return true;
    }
    case GOOGLE_VERTEX_AI: {
      const item = store.next as VertexKeyItem;
      if (!item) {
        return false;
      }
      requestHeaders.set(`x-${POWERED_BY}-vertex-project-id`, item.projectId);
      requestHeaders.set(`x-${POWERED_BY}-vertex-region`, item.region);
      requestHeaders.set(
        `x-${POWERED_BY}-vertex-service-account-json`,
        JSON.stringify(item.serviceAccountJson)
      );
      requestHeaders.set('authorization', `Bearer ${item.apiKey || ''}`);
    }
    case DOUBAO: {
      const item = store.next as DouBaoKeyItem;
      if (!item) {
        return false;
      }
      requestHeaders.set('authorization', `Bearer ${item.apiKey || ''}`);
      if (!modelRequest) {
        return false;
      }
      const realModelName = item.models[modelRequest] || modelRequest;
      requestHeaders.set(`x-${POWERED_BY}-doubao-model-name`, realModelName);
      return true;
    }
    default: {
      const item = store.next as KeyItem;
      if (!item) {
        return false;
      }
      requestHeaders.set('authorization', `Bearer ${item.apiKey || ''}`);
      return true;
    }
  }
}
