import { GenerateTokenOptions } from '../../models/generate-token-options.js';
import { Tokens } from '../../models/tokens.js';

export interface IOutputHandler {
  handleOutput(options: GenerateTokenOptions, tokens: Tokens): void;
}
