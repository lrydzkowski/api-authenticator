import { AuthConfig } from '../../models/auth-config.js';
import { Tokens } from '../../models/tokens.js';
import { IAuthHandler } from './auth-handler.js';
import * as oauth from 'oauth4webapi';

export class ClientCredentialsHandler implements IAuthHandler {
  async getTokensAsync(config: AuthConfig): Promise<Tokens> {
    const authServer: oauth.AuthorizationServer = {
      token_endpoint: config.tokenEndpoint,
      issuer: 'unknown',
    };
    const client: oauth.Client = {
      client_id: config.clientId,
      client_secret: config.clientSecret!,
    };

    const tokens = await this.sendClientCredentialsGrantRequestAsync(config, authServer, client);

    return tokens;
  }

  private async sendClientCredentialsGrantRequestAsync(
    config: AuthConfig,
    authServer: oauth.AuthorizationServer,
    client: oauth.Client,
  ): Promise<Tokens> {
    const parameters: Record<string, string> = this.buildParameters(config);
    const response: Response = await oauth.clientCredentialsGrantRequest(authServer, client, parameters);
    const responseBody = await response.json();
    const accessToken = responseBody?.access_token ?? null;
    if (accessToken === null) {
      throw new Error(
        `OAuth 2.0 Error: Unrecognized response from a token endpoint '${JSON.stringify(responseBody)}'.`,
      );
    }

    const refreshToken = responseBody?.refresh_token ?? null;

    return {
      accessToken,
      refreshToken,
    };
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
