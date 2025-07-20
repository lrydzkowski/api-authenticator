export interface AuthConfig {
  clientId: string;
  clientSecret?: string | null;
  redirectUri?: string;
  scope?: string;
  authorizationEndpoint?: string;
  tokenEndpoint: string;
  audience?: string;
  resource?: string;
  origin?: string;
  flow: 'authorization_code' | 'client_credentials';
  autoFill?: {
    emailSelector?: string;
    email?: string;
    passwordSelector?: string;
    password?: string;
    submitSelector?: string;
  };
}
