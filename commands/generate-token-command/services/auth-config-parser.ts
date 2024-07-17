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

    return authConfig[env];
  }
}
