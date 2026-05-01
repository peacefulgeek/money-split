// DeepSeek V4-Pro via the OpenAI client.
// Required env (master scope §2):
//   OPENAI_API_KEY
//   OPENAI_BASE_URL  (defaults to https://api.deepseek.com)
//   OPENAI_MODEL     (defaults to deepseek-v4-pro)
//
// Safe-by-default: if OPENAI_API_KEY is missing we still construct the client
// (DeepSeek calls will fail at request time) so the app never crashes on cold
// start when run on a host that has not wired the env yet.

import OpenAI from 'openai';

export const DEFAULT_BASE_URL = 'https://api.deepseek.com';
export const DEFAULT_MODEL = 'deepseek-v4-pro';

export const openaiBaseUrl = process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL;
export const openaiModel = process.env.OPENAI_MODEL || DEFAULT_MODEL;

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'missing-key',
  baseURL: openaiBaseUrl,
});

export function hasWritingEngineEnv() {
  return Boolean(process.env.OPENAI_API_KEY);
}
