import { Validator } from 'fluentvalidation-ts';
import { GenerateTokenOptions } from '../models/generate-token-options.js';
import { IFilesHandler } from '../../../core/services/files-handler.js';

export class GenerateTokenOptionsValidator extends Validator<GenerateTokenOptions> {
  constructor(filesHandler: IFilesHandler) {
    super();

    this.ruleFor('configFilePath').notEmpty().withMessage("Path from --config-file-path option doesn't exist.");
    this.ruleFor('env').notEmpty().withMessage('--env option is required');
    this.ruleFor('outputFilePath')
      .must((x) => typeof x === 'string' && filesHandler.exists(x))
      .withMessage("Path from --output-file-path option doesn't exist.")
      .when((x) => typeof x.outputFilePath === 'string');
    this.ruleFor('outputFileAccessTokenKey')
      .notEmpty()
      .when((x) => typeof x.outputFilePath === 'string');
    this.ruleFor('outputFileRefreshTokenKey')
      .notEmpty()
      .when((x) => typeof x.outputFilePath === 'string');
  }
}
