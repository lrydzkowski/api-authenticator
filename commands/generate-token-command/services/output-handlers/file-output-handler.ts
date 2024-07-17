import { IFilesHandler } from '../../../../core/services/files-handler.js';
import { GenerateTokenOptions } from '../../models/generate-token-options.js';
import { IOutputHandler } from './output-handler.js';

export class FileOutputHandler implements IOutputHandler {
  constructor(private filesHandler: IFilesHandler) {}

  public handle(options: GenerateTokenOptions, accessToken: string): void {
    const outputFilePath = options.outputFilePath as string;
    if (!this.filesHandler.exists(outputFilePath)) {
      throw new Error(`Output file doesn't exist (path = '${options.configFilePath}').`);
    }

    const json = this.filesHandler.read(outputFilePath);
    const jsonData = JSON.parse(json);

    const keys = options.outputFileKey?.split("'.'") ?? [];
    let current = jsonData;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = this.parseKey(options, keys[i]);
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = this.parseKey(options, keys[keys.length - 1]);
    current[lastKey] = accessToken;

    let modifiedJson = JSON.stringify(jsonData, null, 2);
    if (options.outputFileWinNewLineChar) {
      modifiedJson = modifiedJson.replaceAll('\n', '\r\n');
    }

    this.filesHandler.write(outputFilePath, modifiedJson);
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
