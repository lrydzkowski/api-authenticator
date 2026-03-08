/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResolveSecretsOptions } from './models/resolve-secrets-options.js';
import { ResolveSecretsOptionsValidator } from './validators/resolve-secrets-options-validator.js';
import { IResolveSecretsConfigParser } from './services/resolve-secrets-config-parser.js';
import { IKeyVaultService } from '../generate-token-command/services/key-vault-service.js';
import { IFilesHandler } from '../../core/services/files-handler.js';
import { Utils } from '../../core/services/utils.js';

export class ResolveSecretsCommand {
  constructor(
    private filesHandler: IFilesHandler,
    private configParser: IResolveSecretsConfigParser,
    private keyVaultService: IKeyVaultService,
  ) {}

  public async runAsync(options: ResolveSecretsOptions): Promise<void> {
    this.validateOptions(options);

    const config = this.configParser.parse(options.configFilePath, options.env);
    const resolvedSecrets = await this.keyVaultService.resolveSecrets(
      config.keyVault.vaultUrl,
      config.keyVault.outputMappings,
    );

    this.writeOutput(options, resolvedSecrets);
  }

  private validateOptions(options: ResolveSecretsOptions): void {
    const validator = new ResolveSecretsOptionsValidator(this.filesHandler);
    const validationErrors = validator.validate(options);
    if (!Utils.isEmptyObj(validationErrors)) {
      throw new Error(`The given options are incorrect. Validation errors: '${JSON.stringify(validationErrors)}'.`);
    }
  }

  private writeOutput(options: ResolveSecretsOptions, secrets: Record<string, string>): void {
    const jsonData = this.filesHandler.exists(options.outputFilePath)
      ? JSON.parse(this.filesHandler.read(options.outputFilePath))
      : {};

    for (const [keyPath, secretValue] of Object.entries(secrets)) {
      this.writeValue(options, keyPath, jsonData, secretValue);
    }

    let modifiedJson = JSON.stringify(jsonData, null, 2);
    if (options.outputFileWinNewLineChar) {
      modifiedJson = modifiedJson.replaceAll('\n', '\r\n');
    }

    this.filesHandler.write(options.outputFilePath, modifiedJson);
  }

  private writeValue(options: ResolveSecretsOptions, key: string, jsonData: any, value: string): void {
    const keys = key.split("'.'");
    let current = jsonData;
    for (let i = 0; i < keys.length - 1; i++) {
      const parsedKey = this.parseKey(options, keys[i]);
      if (!(parsedKey in current)) {
        current[parsedKey] = {};
      }
      current = current[parsedKey];
    }

    const lastKey = this.parseKey(options, keys[keys.length - 1]);
    current[lastKey] = value;
  }

  private parseKey(options: ResolveSecretsOptions, key: string): string {
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
