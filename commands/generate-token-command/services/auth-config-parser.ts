import { AuthConfig } from '../models/auth-config.js';
import { IFilesHandler } from '../../../core/services/files-handler.js';

export interface IAuthConfigParser {
  parse(configPath: string, env: string): AuthConfig;
}

export class AuthConfigParser implements IAuthConfigParser {
  constructor(private filesHandler: IFilesHandler) {}

  public parse(configFilePath: string, env: string): AuthConfig {
    if (!this.filesHandler.exists(configFilePath)) {
      throw new Error(`A configuration file (path = '${configFilePath}') doesn't exist.`);
    }

    const json = this.filesHandler.read(configFilePath);
    const authConfig: { [env: string]: AuthConfig } = JSON.parse(json);
    if (!authConfig[env]) {
      throw new Error(
        `A configuration file (path = '${configFilePath}') doesn't contain the given environment ('${env}').`,
      );
    }

    const envAuthConfig: AuthConfig = authConfig[env];
    envAuthConfig.clientId = envAuthConfig.clientId?.trim() ?? null;
    envAuthConfig.clientSecret = envAuthConfig.clientSecret?.trim() ?? null;
    envAuthConfig.redirectUri = envAuthConfig.redirectUri?.trim() ?? '';
    envAuthConfig.scope = envAuthConfig.scope?.trim();
    envAuthConfig.authorizationEndpoint = envAuthConfig.authorizationEndpoint?.trim();
    envAuthConfig.tokenEndpoint = envAuthConfig.tokenEndpoint?.trim() ?? '';
    envAuthConfig.audience = envAuthConfig.audience?.trim() ?? '';
    envAuthConfig.resource = envAuthConfig.resource?.trim() ?? '';
    envAuthConfig.origin = envAuthConfig.origin?.trim() ?? '';

    return envAuthConfig;
  }
}
