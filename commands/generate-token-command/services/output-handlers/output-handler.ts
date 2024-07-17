import { GenerateTokenOptions } from '../../models/generate-token-options.js';

export interface IOutputHandler {
  handle(options: GenerateTokenOptions, accessToken: string): void;
}
