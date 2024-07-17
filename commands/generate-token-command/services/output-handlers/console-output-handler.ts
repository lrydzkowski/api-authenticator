import { ILogger } from '../../../../core/services/logger.js';
import { GenerateTokenOptions } from '../../models/generate-token-options.js';
import { IOutputHandler } from './output-handler.js';

export class ConsoleOutputHandler implements IOutputHandler {
  constructor(private logger: ILogger) {}

  handle(options: GenerateTokenOptions, accessToken: string): void {
    this.logger.logInfo(accessToken);
  }
}
