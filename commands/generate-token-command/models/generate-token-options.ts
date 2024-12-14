export interface GenerateTokenOptions {
  configFilePath: string;
  env: string;
  addPrefixToAccessToken?: boolean;
  outputFilePath?: string;
  outputFileAccessTokenKey?: string;
  outputFileRefreshTokenKey?: string;
  outputFileIdTokenKey?: string;
  outputFileWinNewLineChar?: boolean;
  notUseRefreshToken?: boolean;
}
