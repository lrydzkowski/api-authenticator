import { GenerateTokenOptions } from '../../models/generate-token-options.js';
import { IOutputHandler } from './output-handler.js';

export interface IOutputHandlerResolver {
  resolve(options: GenerateTokenOptions): IOutputHandler;
}

export class OutputHandlerResolver implements IOutputHandlerResolver {
  constructor(
    private fileOutputHandler: IOutputHandler,
    private consoleOutputHandler: IOutputHandler,
  ) {}

  public resolve(options: GenerateTokenOptions): IOutputHandler {
    if (options.outputFilePath && options.outputFileAccessTokenKey) {
      return this.fileOutputHandler;
    }

    return this.consoleOutputHandler;
  }
}
