import { Validator } from 'fluentvalidation-ts';
import { AuthConfig } from '../models/auth-config.js';

export class AuthConfigValidator extends Validator<AuthConfig> {
  constructor() {
    super();

    this.ruleFor('clientId').notEmpty().withMessage("You have to add 'clientId' property to the configuration.");
    this.ruleFor('clientSecret')
      .notEmpty()
      .withMessage("You have to add 'clientSecret' property to the configuration.")
      .when((x) => x.flow == 'client_credentials');
    this.ruleFor('authorizationEndpoint')
      .notEmpty()
      .withMessage("You have to add 'authorizationEndpoint' property to the configuration.")
      .when((x) => x.flow == 'authorization_code');
    this.ruleFor('tokenEndpoint')
      .notEmpty()
      .withMessage("You have to add 'tokenEndpoint' property to the configuration.");
    this.ruleFor('flow').notEmpty().withMessage("You have to add 'flow' property to the configuration.");
  }
}
