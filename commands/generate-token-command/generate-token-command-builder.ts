import { FilesHandler, IFilesHandler } from '../../core/services/files-handler.js';
import { ILogger, Logger } from '../../core/services/logger.js';
import { GenerateTokenCommand } from './generate-token-command.js';
import { AuthConfigParser } from './services/auth-config-parser.js';
import { AuthHandlerResolver } from './services/auth-handlers/auth-handler-resolver.js';
import { IAuthHandler } from './services/auth-handlers/auth-handler.js';
import { AuthorizationCodeHandler } from './services/auth-handlers/authorization-code-handler.js';
import { ClientCredentialsHandler } from './services/auth-handlers/client-credentials-handler.js';
import { ConsoleOutputHandler } from './services/output-handlers/console-output-handler.js';
import { FileOutputHandler, IFileOutputHandler } from './services/output-handlers/file-output-handler.js';
import { OutputHandlerResolver } from './services/output-handlers/output-handler-resolver.js';
import { IOutputHandler } from './services/output-handlers/output-handler.js';
import { IKeyVaultService, KeyVaultService } from './services/key-vault-service.js';

export const buildGenerateTokenCommand = (
  filesHandler: IFilesHandler | null = null,
  logger: ILogger | null = null,
  authorizationCodeHandler: IAuthHandler | null = null,
  clientCredentialsHandler: IAuthHandler | null = null,
  fileOutputHandler: (IOutputHandler & IFileOutputHandler) | null = null,
  consoleOutputHandler: IOutputHandler | null = null,
  keyVaultService: IKeyVaultService | null = null,
): GenerateTokenCommand => {
  filesHandler ??= new FilesHandler();
  logger ??= new Logger();
  keyVaultService ??= new KeyVaultService(logger);
  const authConfigParser = new AuthConfigParser(filesHandler, keyVaultService);
  authorizationCodeHandler ??= new AuthorizationCodeHandler(logger, filesHandler);
  clientCredentialsHandler ??= new ClientCredentialsHandler();
  const authHandlerResolver = new AuthHandlerResolver(authorizationCodeHandler, clientCredentialsHandler);
  fileOutputHandler ??= new FileOutputHandler(filesHandler);
  consoleOutputHandler ??= new ConsoleOutputHandler(logger);
  const outputHandlerResolver = new OutputHandlerResolver(fileOutputHandler, consoleOutputHandler);
  const generateTokenCommand = new GenerateTokenCommand(
    filesHandler,
    authConfigParser,
    fileOutputHandler,
    authHandlerResolver,
    outputHandlerResolver,
  );

  return generateTokenCommand;
};
