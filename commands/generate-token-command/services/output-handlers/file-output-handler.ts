/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFilesHandler } from '../../../../core/services/files-handler.js';
import { GenerateTokenOptions } from '../../models/generate-token-options.js';
import { Tokens } from '../../models/tokens.js';
import { IOutputHandler } from './output-handler.js';

export interface IFileOutputHandler {
  getRefreshToken(options: GenerateTokenOptions): string | null;
}

export class FileOutputHandler implements IOutputHandler, IFileOutputHandler {
  constructor(private filesHandler: IFilesHandler) {}

  public getRefreshToken(options: GenerateTokenOptions): string | null {
    if (options.notUseRefreshToken) {
      return null;
    }

    if (!options.outputFilePath) {
      return null;
    }

    if (!options.outputFileRefreshTokenKey) {
      return null;
    }

    const json = this.filesHandler.read(options.outputFilePath);
    const jsonData = JSON.parse(json);
    const refreshToken = this.getValue(options, options.outputFileRefreshTokenKey ?? null, jsonData);

    return refreshToken;
  }

  public handleOutput(options: GenerateTokenOptions, tokens: Tokens): void {
    const outputFilePath = options.outputFilePath as string;
    if (!this.filesHandler.exists(outputFilePath)) {
      throw new Error(`Output file doesn't exist (path = '${options.configFilePath}').`);
    }

    const json = this.filesHandler.read(outputFilePath);
    const jsonData = JSON.parse(json);

    this.writeValue(options, options.outputFileAccessTokenKey ?? null, jsonData, tokens.accessToken);
    this.writeValue(options, options.outputFileRefreshTokenKey ?? null, jsonData, tokens.refreshToken);

    let modifiedJson = JSON.stringify(jsonData, null, 2);
    if (options.outputFileWinNewLineChar) {
      modifiedJson = modifiedJson.replaceAll('\n', '\r\n');
    }

    this.filesHandler.write(outputFilePath, modifiedJson);
  }

  private getValue(options: GenerateTokenOptions, key: string | null, jsonData: any): string | null {
    if (key === null) {
      return null;
    }

    const keys = key?.split("'.'") ?? [];
    let current = jsonData;
    for (let i = 0; i < keys.length; i++) {
      const key = this.parseKey(options, keys[i]);
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    if (typeof current !== 'string') {
      return null;
    }

    return current;
  }

  private writeValue(options: GenerateTokenOptions, key: string | null, jsonData: any, value: string | null): void {
    if (key === null || value === null) {
      return;
    }

    const keys = key?.split("'.'") ?? [];
    let current = jsonData;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = this.parseKey(options, keys[i]);
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = this.parseKey(options, keys[keys.length - 1]);
    current[lastKey] = value;
  }

  private parseKey(options: GenerateTokenOptions, key: string): string {
    if (key.startsWith("'")) {
      key = key.slice(1);
    }

    if (key.endsWith("'")) {
      key = key.slice(0, -1);
    }

    switch (key) {
      case '{env}':
        return options.env;
      default:
        return key;
    }
  }
}
