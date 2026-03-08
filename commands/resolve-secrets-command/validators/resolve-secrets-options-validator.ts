import { Validator } from 'fluentvalidation-ts';
import { ResolveSecretsOptions } from '../models/resolve-secrets-options.js';
import { IFilesHandler } from '../../../core/services/files-handler.js';

export class ResolveSecretsOptionsValidator extends Validator<ResolveSecretsOptions> {
  constructor(filesHandler: IFilesHandler) {
    super();

    this.ruleFor('configFilePath')
      .must((x) => filesHandler.exists(x))
      .withMessage("Path from --config-file-path option doesn't exist.");
    this.ruleFor('env').notEmpty().withMessage('--env option is required');
    this.ruleFor('outputFilePath').notEmpty().withMessage('--output-file-path option is required');
  }
}
