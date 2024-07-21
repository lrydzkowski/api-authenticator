import { AuthConfig } from './models/auth-config.js';
import { IAuthHandlerResolver } from './services/auth-handlers/auth-handler-resolver.js';
import { AuthConfigValidator } from './validators/auth-config-validator.js';
import { Utils } from '../../core/services/utils.js';
import { IAuthConfigParser } from './services/auth-config-parser.js';
import { GenerateTokenOptions } from './models/generate-token-options.js';
import { GenerateTokenOptionsValidator } from './validators/generate-token-options-validator.js';
import { IOutputHandlerResolver } from './services/output-handlers/output-handler-resolver.js';
import { IFilesHandler } from '../../core/services/files-handler.js';
import { Tokens } from './models/tokens.js';
import { IFileOutputHandler } from './services/output-handlers/file-output-handler.js';

export class GenerateTokenCommand {
  constructor(
    private filesHandler: IFilesHandler,
    private authConfigParser: IAuthConfigParser,
    private fileOutputHandler: IFileOutputHandler,
    private authHandlerResolver: IAuthHandlerResolver,
    private outputHandlerResolver: IOutputHandlerResolver,
  ) {}

  public async runAsync(options: GenerateTokenOptions): Promise<void> {
    this.validateOptions(options);

    const authConfig: AuthConfig = this.authConfigParser.parse(options.configFilePath, options.env);
    this.validateAuthConfig(authConfig);

    const refreshToken = this.fileOutputHandler.getRefreshToken(options);

    const authHandler = this.authHandlerResolver.resolve(authConfig);
    const tokens = await authHandler.getTokensAsync(authConfig, refreshToken);
    this.parseAccessToken(options, tokens);

    const outputHandler = this.outputHandlerResolver.resolve(options);
    outputHandler.handleOutput(options, tokens);
  }

  private validateOptions(options: GenerateTokenOptions): void {
    const validator = new GenerateTokenOptionsValidator(this.filesHandler);
    const validationErrors = validator.validate(options);
    if (!Utils.isEmptyObj(validationErrors)) {
      throw new Error(`The given options are incorrect. Validation errors: '${JSON.stringify(validationErrors)}'.`);
    }
  }

  private validateAuthConfig(authConfig: AuthConfig): void {
    const validator = new AuthConfigValidator();
    const validationErrors = validator.validate(authConfig);
    if (!Utils.isEmptyObj(validationErrors)) {
      throw new Error(
        `The given configuration is incorrect. Validation errors: '${JSON.stringify(validationErrors)}'.`,
      );
    }
  }

  private parseAccessToken(options: GenerateTokenOptions, tokens: Tokens): void {
    if (options.addPrefixToAccessToken) {
      tokens.accessToken = `Bearer ${tokens.accessToken}`;
    }
  }
}
