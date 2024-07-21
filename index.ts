#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import { GenerateTokenCommand } from './commands/generate-token-command/generate-token-command.js';
import { Logger } from './core/services/logger.js';
import { AuthConfigParser } from './commands/generate-token-command/services/auth-config-parser.js';
import { GenerateTokenOptions } from './commands/generate-token-command/models/generate-token-options.js';
import { FilesHandler } from './core/services/files-handler.js';
import { AuthHandlerResolver } from './commands/generate-token-command/services/auth-handlers/auth-handler-resolver.js';
import { OutputHandlerResolver } from './commands/generate-token-command/services/output-handlers/output-handler-resolver.js';
import { FileOutputHandler } from './commands/generate-token-command/services/output-handlers/file-output-handler.js';

const program = new Command();
program
  .name('api-authenticator')
  .description('A console app generating an access token for APIs protected by OAuth 2.0 protocol.')
  .version('1.0.5');

program
  .command('generate-token')
  .requiredOption('--config-file-path <config_path>')
  .requiredOption('--env <environment>')
  .option('--add-prefix-to-access-token')
  .option('--output-file-path <output_file_path>')
  .option('--output-file-access-token-key <output_file_access_token_key>')
  .option('--output-file-refresh-token-key <output_file_refresh_token_key>')
  .option('--output-file-win-new-line-char')
  .option('--not-use-refresh-token')
  .action(async (options: GenerateTokenOptions, command) => {
    try {
      const filesHandler = new FilesHandler();
      const logger = new Logger();
      const authConfigParser = new AuthConfigParser(filesHandler);
      const authHandlerResolver = new AuthHandlerResolver();
      const fileOutputHandler = new FileOutputHandler(filesHandler);
      const outputHandlerResolver = new OutputHandlerResolver(filesHandler, logger);
      const generateTokenCommand = new GenerateTokenCommand(
        filesHandler,
        authConfigParser,
        fileOutputHandler,
        authHandlerResolver,
        outputHandlerResolver,
      );
      await generateTokenCommand.runAsync(options);
    } catch (error) {
      command.error(`error: ${(error as Error)?.message}`);
      process.exit(1);
    }
  });

program.parse();
