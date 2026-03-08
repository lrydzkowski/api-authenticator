import { FilesHandler, IFilesHandler } from '../../core/services/files-handler.js';
import { ILogger, Logger } from '../../core/services/logger.js';
import { IKeyVaultService, KeyVaultService } from '../generate-token-command/services/key-vault-service.js';
import { IResolveSecretsConfigParser, ResolveSecretsConfigParser } from './services/resolve-secrets-config-parser.js';
import { ResolveSecretsCommand } from './resolve-secrets-command.js';

export const buildResolveSecretsCommand = (
  filesHandler: IFilesHandler | null = null,
  logger: ILogger | null = null,
  keyVaultService: IKeyVaultService | null = null,
  configParser: IResolveSecretsConfigParser | null = null,
): ResolveSecretsCommand => {
  filesHandler ??= new FilesHandler();
  logger ??= new Logger();
  keyVaultService ??= new KeyVaultService(logger);
  configParser ??= new ResolveSecretsConfigParser(filesHandler);
  const resolveSecretsCommand = new ResolveSecretsCommand(filesHandler, configParser, keyVaultService);

  return resolveSecretsCommand;
};
