import { AuthConfig } from '../../models/auth-config.js';
import { IAuthHandler } from './auth-handler.js';
import * as oauth from 'oauth4webapi';

export class ClientCredentialsHandler implements IAuthHandler {
  async getAccessTokenAsync(config: AuthConfig): Promise<string> {
    const authServer: oauth.AuthorizationServer = {
      token_endpoint: config.tokenEndpoint,
      issuer: 'unknown',
    };
    const client: oauth.Client = {
      client_id: config.clientId,
      client_secret: config.clientSecret!,
    };

    const accessToken = await this.getTokenAsync(config, authServer, client);

    return accessToken;
  }

  private async getTokenAsync(
    config: AuthConfig,
    authServer: oauth.AuthorizationServer,
    client: oauth.Client,
  ): Promise<string> {
    const parameters: Record<string, string> = this.buildParameters(config);
    const response: Response = await oauth.clientCredentialsGrantRequest(authServer, client, parameters);
    const responseBody = await response.json();
    const accessToken = responseBody?.access_token ?? null;
    if (accessToken === null) {
      throw new Error(
        `OAuth 2.0 Error: Unrecognized response from a token endpoint '${JSON.stringify(responseBody)}'.`,
      );
    }

    return accessToken;
  }

  private buildParameters(config: AuthConfig) {
    const parameters: Record<string, string> = {};
    this.addParamIfExists(parameters, config, 'resource');

    return parameters;
  }

  private addParamIfExists(parameters: Record<string, string>, config: AuthConfig, paramName: keyof AuthConfig): void {
    if (!config[paramName]) {
      return;
    }

    parameters[paramName] = config[paramName];
  }
}
