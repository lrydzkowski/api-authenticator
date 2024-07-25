import { AuthConfig } from '../../models/auth-config';
import { IAuthHandler } from './auth-handler.js';

export interface IAuthHandlerResolver {
  resolve(config: AuthConfig): IAuthHandler;
}

export class AuthHandlerResolver implements IAuthHandlerResolver {
  constructor(
    private authorizationCodeHandler: IAuthHandler,
    private clientCredentialsHandler: IAuthHandler,
  ) {}

  public resolve(config: AuthConfig): IAuthHandler {
    switch (config.flow) {
      case 'authorization_code':
        return this.authorizationCodeHandler;
      case 'client_credentials':
        return this.clientCredentialsHandler;
      default:
        throw new Error(`An unexpected auth flow: '${config.flow}'.`);
    }
  }
}
