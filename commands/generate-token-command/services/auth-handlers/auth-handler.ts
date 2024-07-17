import { AuthConfig } from '../../models/auth-config.js';

export interface IAuthHandler {
  getAccessTokenAsync(config: AuthConfig): Promise<string>;
}
