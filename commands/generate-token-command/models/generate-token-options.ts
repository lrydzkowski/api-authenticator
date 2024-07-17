export interface GenerateTokenOptions {
  configFilePath: string;
  env: string;
  addPrefixToOutput?: boolean;
  outputFilePath?: string;
  outputFileKey?: string;
  outputFileWinNewLineChar?: boolean;
}
