import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { AuthConfig } from '../models/auth-config.js';
import { ILogger } from '../../../core/services/logger.js';

export interface IKeyVaultService {
  applySecretOverrides(authConfig: AuthConfig): Promise<AuthConfig>;
  resolveOutputMappings(authConfig: AuthConfig): Promise<Record<string, string>>;
  resolveSecrets(vaultUrl: string, mappings: Record<string, string>): Promise<Record<string, string>>;
}

export class KeyVaultService implements IKeyVaultService {
  private credential = new DefaultAzureCredential();
  private clients = new Map<string, SecretClient>();

  constructor(private logger: ILogger) {}

  private getClient(vaultUrl: string): SecretClient {
    let client = this.clients.get(vaultUrl);
    if (!client) {
      client = new SecretClient(vaultUrl, this.credential);
      this.clients.set(vaultUrl, client);
    }

    return client;
  }

  public async applySecretOverrides(authConfig: AuthConfig): Promise<AuthConfig> {
    if (!authConfig.keyVault?.vaultUrl || !authConfig.keyVault?.secretMappings) {
      return authConfig;
    }

    try {
      const client = this.getClient(authConfig.keyVault.vaultUrl);

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
      return await this.resolveSecrets(authConfig.keyVault.vaultUrl, authConfig.keyVault.outputMappings);
    } catch (error) {
      this.logger.logError(`KeyVault output mappings failed: ${(error as Error).message}`);

      return {};
    }
  }

  public async resolveSecrets(vaultUrl: string, mappings: Record<string, string>): Promise<Record<string, string>> {
    const client = this.getClient(vaultUrl);
    const result: Record<string, string> = {};

    for (const [outputKeyPath, secretName] of Object.entries(mappings)) {
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
