import { AuthConfig } from '../../models/auth-config.js';
import { Tokens } from '../../models/tokens.js';

export interface IAuthHandler {
  getTokensAsync(config: AuthConfig, refreshToken: string | null): Promise<Tokens>;
}
