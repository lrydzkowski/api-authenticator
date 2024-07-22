import { FilesHandler, IFilesHandler } from '../../core/services/files-handler.js';
import { Logger } from '../../core/services/logger.js';
import { GenerateTokenCommand } from './generate-token-command.js';
import { AuthConfigParser } from './services/auth-config-parser.js';
import { AuthHandlerResolver } from './services/auth-handlers/auth-handler-resolver.js';
import { FileOutputHandler } from './services/output-handlers/file-output-handler.js';
import { OutputHandlerResolver } from './services/output-handlers/output-handler-resolver.js';

export const buildGenerateTokenCommand = (filesHandler: IFilesHandler | null = null): GenerateTokenCommand => {
  filesHandler ??= new FilesHandler();
  const logger = new Logger();
  const authConfigParser = new AuthConfigParser(filesHandler);
  const authHandlerResolver = new AuthHandlerResolver();
  const fileOutputHandler = new FileOutputHandler(filesHandler);
  const outputHandlerResolver = new OutputHandlerResolver(filesHandler, logger);
  const generateTokenCommand = new GenerateTokenCommand(
    filesHandler,
    authConfigParser,
    fileOutputHandler,
    authHandlerResolver,
    outputHandlerResolver,
  );

  return generateTokenCommand;
};
