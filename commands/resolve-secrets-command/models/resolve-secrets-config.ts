export interface ResolveSecretsConfig {
  keyVault: {
    vaultUrl: string;
    outputMappings: Record<string, string>;
  };
}
