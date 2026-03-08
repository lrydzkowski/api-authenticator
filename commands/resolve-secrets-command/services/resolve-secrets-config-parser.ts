import { ResolveSecretsConfig } from '../models/resolve-secrets-config.js';
import { IFilesHandler } from '../../../core/services/files-handler.js';

export interface IResolveSecretsConfigParser {
  parse(configFilePath: string, env: string): ResolveSecretsConfig;
}

export class ResolveSecretsConfigParser implements IResolveSecretsConfigParser {
  constructor(private filesHandler: IFilesHandler) {}

  public parse(configFilePath: string, env: string): ResolveSecretsConfig {
    const json = this.filesHandler.read(configFilePath);
    const config: { [env: string]: ResolveSecretsConfig } = JSON.parse(json);

    if (!config[env]) {
      throw new Error(
        `A configuration file (path = '${configFilePath}') doesn't contain the given environment ('${env}').`,
      );
    }

    const envConfig = config[env];

    if (!envConfig.keyVault) {
      throw new Error(`Configuration for environment '${env}' is missing the 'keyVault' section.`);
    }

    envConfig.keyVault.vaultUrl = envConfig.keyVault.vaultUrl?.trim() ?? '';
    if (!envConfig.keyVault.vaultUrl) {
      throw new Error(`Configuration for environment '${env}' has an empty 'keyVault.vaultUrl'.`);
    }

    if (!envConfig.keyVault.outputMappings || Object.keys(envConfig.keyVault.outputMappings).length === 0) {
      throw new Error(`Configuration for environment '${env}' has empty 'keyVault.outputMappings'.`);
    }

    for (const [key, value] of Object.entries(envConfig.keyVault.outputMappings)) {
      envConfig.keyVault.outputMappings[key] = value?.trim() ?? '';
    }

    return envConfig;
  }
}
