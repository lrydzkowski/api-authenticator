import { Validator } from 'fluentvalidation-ts';
import { AuthConfig } from '../models/auth-config.js';

export class AuthConfigValidator extends Validator<AuthConfig> {
  constructor() {
    super();

    this.ruleFor('clientId')
      .notNull()
      .withMessage("You have to add 'clientId' property to the configuration.")
      .notEmpty()
      .withMessage("You have to add 'clientId' property to the configuration.");
    this.ruleFor('clientSecret')
      .notNull()
      .withMessage("You have to add 'clientSecret' property to the configuration.")
      .notEmpty()
      .withMessage("You have to add 'clientSecret' property to the configuration.")
      .when((x) => x.flow == 'client_credentials');
    this.ruleFor('authorizationEndpoint')
      .notNull()
      .withMessage("You have to add 'authorizationEndpoint' property to the configuration.")
      .notEmpty()
      .withMessage("You have to add 'authorizationEndpoint' property to the configuration.")
      .when((x) => x.flow == 'authorization_code');
    this.ruleFor('tokenEndpoint')
      .notNull()
      .withMessage("You have to add 'tokenEndpoint' property to the configuration.")
      .notEmpty()
      .withMessage("You have to add 'tokenEndpoint' property to the configuration.");
    this.ruleFor('flow').notEmpty().withMessage("You have to add 'flow' property to the configuration.");
    this.ruleFor('keyVault')
      .must((keyVault) => {
        if (!keyVault) {
          return true;
        }

        return keyVault.vaultUrl?.trim()?.length > 0;
      })
      .withMessage("When 'keyVault' is specified, 'vaultUrl' is required and cannot be empty.");
    this.ruleFor('keyVault')
      .must((keyVault) => {
        if (!keyVault?.vaultUrl) {
          return true;
        }

        try {
          new URL(keyVault.vaultUrl);

          return keyVault.vaultUrl.includes('vault.azure.net');
        } catch {
          return false;
        }
      })
      .withMessage(
        "'keyVault.vaultUrl' must be a valid Azure Key Vault URL (e.g., https://your-vault.vault.azure.net).",
      );
  }
}
