import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { AuthConfig } from '../models/auth-config.js';
import { ILogger } from '../../../core/services/logger.js';

export interface IKeyVaultService {
  applySecretOverrides(authConfig: AuthConfig): Promise<AuthConfig>;
  resolveOutputMappings(authConfig: AuthConfig): Promise<Record<string, string>>;
}

export class KeyVaultService implements IKeyVaultService {
  constructor(private logger: ILogger) {}

  public async applySecretOverrides(authConfig: AuthConfig): Promise<AuthConfig> {
    if (!authConfig.keyVault?.vaultUrl || !authConfig.keyVault?.secretMappings) {
      return authConfig;
    }

    try {
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(authConfig.keyVault.vaultUrl, credential);

      const overriddenConfig = structuredClone(authConfig);

      for (const [configField, secretName] of Object.entries(authConfig.keyVault.secretMappings)) {
        try {
          const secret = await client.getSecret(secretName);
          if (secret.value) {
            this.setConfigValue(overriddenConfig, configField, secret.value);
          }
        } catch (error) {
          throw new Error(
            `Failed to retrieve secret '${secretName}' for config field '${configField}': ${(error as Error).message}`,
          );
        }
      }

      return overriddenConfig;
    } catch (error) {
      this.logger.logError(`KeyVault integration failed: ${(error as Error).message}`);

      return authConfig;
    }
  }

  public async resolveOutputMappings(authConfig: AuthConfig): Promise<Record<string, string>> {
    if (!authConfig.keyVault?.vaultUrl || !authConfig.keyVault?.outputMappings) {
      return {};
    }

    try {
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(authConfig.keyVault.vaultUrl, credential);
      const result: Record<string, string> = {};

      for (const [outputKeyPath, secretName] of Object.entries(authConfig.keyVault.outputMappings)) {
        try {
          const secret = await client.getSecret(secretName);
          if (secret.value) {
            result[outputKeyPath] = secret.value;
          }
        } catch (error) {
          throw new Error(
            `Failed to retrieve secret '${secretName}' for output key '${outputKeyPath}': ${(error as Error).message}`,
          );
        }
      }

      return result;
    } catch (error) {
      this.logger.logError(`KeyVault output mappings failed: ${(error as Error).message}`);

      return {};
    }
  }

  private setConfigValue(config: AuthConfig, field: string, value: string): void {
    const nestedFields = field.split('.');
    let current: Record<string, unknown> = config as unknown as Record<string, unknown>;

    for (let i = 0; i < nestedFields.length - 1; i++) {
      const fieldName = nestedFields[i];
      if (!(fieldName in current) || typeof current[fieldName] !== 'object') {
        current[fieldName] = {};
      }
      current = current[fieldName] as Record<string, unknown>;
    }

    const finalField = nestedFields[nestedFields.length - 1];
    current[finalField] = value;
  }
}
