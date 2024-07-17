import { AuthConfig } from '../../models/auth-config';
import { IAuthHandler } from './auth-handler.js';
import { AuthorizationCodeHandler } from './authorization-code-handler.js';
import { ClientCredentialsHandler } from './client-credentials-handler.js';

export interface IAuthHandlerResolver {
  resolve(config: AuthConfig): IAuthHandler;
}

export class AuthHandlerResolver implements IAuthHandlerResolver {
  public resolve(config: AuthConfig): IAuthHandler {
    switch (config.flow) {
      case 'authorization_code':
        return new AuthorizationCodeHandler();
      case 'client_credentials':
        return new ClientCredentialsHandler();
      default:
        throw new Error(`An unexpected auth flow: '${config.flow}'.`);
    }
  }
}
