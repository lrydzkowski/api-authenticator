#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import { GenerateTokenOptions } from './commands/generate-token-command/models/generate-token-options.js';
import { buildGenerateTokenCommand } from './commands/generate-token-command/generate-token-command-builder.js';
import { ResolveSecretsOptions } from './commands/resolve-secrets-command/models/resolve-secrets-options.js';
import { buildResolveSecretsCommand } from './commands/resolve-secrets-command/resolve-secrets-command-builder.js';

const program = new Command();
program
  .name('api-authenticator')
  .description('A console app generating an access token for APIs protected by OAuth 2.0 protocol.')
  .version('1.0.14');

program
  .command('generate-token')
  .requiredOption('--config-file-path <config_path>')
  .requiredOption('--env <environment>')
  .option('--add-prefix-to-access-token')
  .option('--output-file-path <output_file_path>')
  .option('--output-file-access-token-key <output_file_access_token_key>')
  .option('--output-file-refresh-token-key <output_file_refresh_token_key>')
  .option('--output-file-id-token-key <output_file_id_token_key>')
  .option('--output-file-win-new-line-char')
  .option('--not-use-refresh-token')
  .action(async (options: GenerateTokenOptions, command) => {
    try {
      const generateTokenCommand = buildGenerateTokenCommand();
      await generateTokenCommand.runAsync(options);
    } catch (error) {
      command.error(`error: ${(error as Error)?.message}`);
      process.exit(1);
    }
  });

program
  .command('resolve-secrets')
  .requiredOption('--config-file-path <config_path>')
  .requiredOption('--env <environment>')
  .requiredOption('--output-file-path <output_file_path>')
  .option('--output-file-win-new-line-char')
  .action(async (options: ResolveSecretsOptions, command) => {
    try {
      const resolveSecretsCommand = buildResolveSecretsCommand();
      await resolveSecretsCommand.runAsync(options);
    } catch (error) {
      command.error(`error: ${(error as Error)?.message}`);
      process.exit(1);
    }
  });

program.parse();
