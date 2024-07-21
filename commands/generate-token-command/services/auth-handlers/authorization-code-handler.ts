import puppeteer from 'puppeteer';
import { AuthConfig } from '../../models/auth-config.js';
import { IAuthHandler } from './auth-handler.js';
import * as oauth from 'oauth4webapi';
import { Tokens } from '../../models/tokens.js';

export class AuthorizationCodeHandler implements IAuthHandler {
  public async getTokensAsync(config: AuthConfig, refreshToken: string | null): Promise<Tokens> {
    const authServer: oauth.AuthorizationServer = {
      authorization_endpoint: config.authorizationEndpoint,
      token_endpoint: config.tokenEndpoint,
      issuer: 'unknown',
    };
    const client: oauth.Client = {
      client_id: config.clientId,
      token_endpoint_auth_method: 'none',
    };

    const refreshedTokens: Tokens | null = await this.refreshTokensAsync(authServer, client, refreshToken);
    if (refreshedTokens) {
      return refreshedTokens;
    }

    const codeVerifier = oauth.generateRandomCodeVerifier();
    const state = oauth.generateRandomState();

    const authUrl = await this.buildAuthUrlAsync(config, codeVerifier, state);
    const authResponse = await this.getAuthResponseAsync(authUrl);
    const authResponseValidationResult = this.validateAuthResponse(authServer, client, authResponse, state);
    const origin = config.origin ?? null;
    const tokens = await this.sendAuthorizationCodeGrantRequestAsync(
      authServer,
      client,
      authResponseValidationResult,
      authResponse,
      codeVerifier,
      origin,
    );

    return tokens;
  }

  private async refreshTokensAsync(
    authServer: oauth.AuthorizationServer,
    client: oauth.Client,
    refreshToken: string | null,
  ): Promise<Tokens | null> {
    if (!refreshToken) {
      return null;
    }

    const response: Response = await oauth.refreshTokenGrantRequest(authServer, client, refreshToken);
    const responseBody = await response.json();
    const accessToken = responseBody?.access_token ?? null;
    if (accessToken === null) {
      return null;
    }

    const newRefreshToken = responseBody?.refresh_token ?? null;

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async buildAuthUrlAsync(config: AuthConfig, codeVerifier: string, state: string): Promise<URL> {
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

    const authUrl = new URL(config.authorizationEndpoint!);
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('response_type', 'code');
    this.addSearchParamIfExists(authUrl, config, 'scope');
    authUrl.searchParams.set('state', state);
    this.addSearchParamIfExists(authUrl, config, 'redirectUri', 'redirect_uri');
    this.addSearchParamIfExists(authUrl, config, 'audience');

    return authUrl;
  }

  private addSearchParamIfExists(
    authUrl: URL,
    config: AuthConfig,
    configParamName: keyof AuthConfig,
    searchParamName: string | null = null,
  ): void {
    if (!config[configParamName]) {
      return;
    }

    if (searchParamName === null) {
      searchParamName = configParamName;
    }

    authUrl.searchParams.set(searchParamName, config[configParamName] as string);
  }

  private async getAuthResponseAsync(authorizationUrl: URL): Promise<AuthResponse> {
    const timeout = 600000; // 10 minutes
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 800, height: 800 },
      args: ['--window-size=800,800'],
      protocolTimeout: timeout,
    });
    try {
      const pages = await browser.pages();
      if (pages.length === 0) {
        throw new Error('No pages in the browse run by Puppeteer.');
      }

      const page = pages[0];
      await page.goto(authorizationUrl.toString(), { waitUntil: 'networkidle0' });
      await page.setRequestInterception(true);
      const resultPromise = new Promise<AuthResponse>((resolve) => {
        page.on('request', (request) => {
          const url = new URL(request.url());
          if (!url.searchParams.has('code')) {
            request.continue();

            return;
          }

          const urlSearchParams = new URLSearchParams(url.search);
          url.search = '';
          const redirectUri = url.toString();

          const authResponse = { redirectUri, urlSearchParams };
          resolve(authResponse);
          request.abort();
        });
      });

      const result = await resultPromise;

      return result;
    } finally {
      await browser.close();
    }
  }

  private validateAuthResponse(
    authServer: oauth.AuthorizationServer,
    client: oauth.Client,
    authResponse: AuthResponse,
    state: string,
  ) {
    const authResponseValidationResult = oauth.validateAuthResponse(
      authServer,
      client,
      authResponse.urlSearchParams,
      state,
    );
    if (oauth.isOAuth2Error(authResponseValidationResult)) {
      throw new Error(`OAuth 2.0 Error: '${authResponseValidationResult.error}'.`);
    }

    return authResponseValidationResult;
  }

  private async sendAuthorizationCodeGrantRequestAsync(
    authServer: oauth.AuthorizationServer,
    client: oauth.Client,
    authResponseValidationResult: URLSearchParams,
    authResponse: AuthResponse,
    codeVerifier: string,
    origin: string | null,
  ): Promise<Tokens> {
    const options: oauth.TokenEndpointRequestOptions = {};
    if (origin !== null) {
      options.headers = {
        origin,
      };
    }

    const response: Response = await oauth.authorizationCodeGrantRequest(
      authServer,
      client,
      authResponseValidationResult,
      authResponse.redirectUri,
      codeVerifier,
      options,
    );
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
}

interface AuthResponse {
  redirectUri: string;
  urlSearchParams: URLSearchParams;
}
