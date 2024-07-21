import { IFilesHandler } from '../../../../core/services/files-handler.js';
import { ILogger } from '../../../../core/services/logger.js';
import { GenerateTokenOptions } from '../../models/generate-token-options.js';
import { ConsoleOutputHandler } from './console-output-handler.js';
import { FileOutputHandler } from './file-output-handler.js';
import { IOutputHandler } from './output-handler.js';

export interface IOutputHandlerResolver {
  resolve(options: GenerateTokenOptions): IOutputHandler;
}

export class OutputHandlerResolver implements IOutputHandlerResolver {
  constructor(
    private filesHandler: IFilesHandler,
    private logger: ILogger,
  ) {}

  public resolve(options: GenerateTokenOptions): IOutputHandler {
    if (options.outputFilePath && options.outputFileAccessTokenKey) {
      return new FileOutputHandler(this.filesHandler);
    }

    return new ConsoleOutputHandler(this.logger);
  }
}
