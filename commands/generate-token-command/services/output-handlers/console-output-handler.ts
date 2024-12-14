import { ILogger } from '../../../../core/services/logger.js';
import { GenerateTokenOptions } from '../../models/generate-token-options.js';
import { Tokens } from '../../models/tokens.js';
import { IOutputHandler } from './output-handler.js';

export class ConsoleOutputHandler implements IOutputHandler {
  constructor(private logger: ILogger) {}

  handleOutput(options: GenerateTokenOptions, tokens: Tokens): void {
    this.logger.logInfo(`Access token:\n${tokens.accessToken}`);
    this.logger.logInfo(`Refresh token: \n${tokens.refreshToken ?? 'no refresh token'}`);
    this.logger.logInfo(`Id token: \n${tokens.idToken ?? 'no id token'}`);
  }
}
