import { buildResolveSecretsCommand } from '../../commands/resolve-secrets-command/resolve-secrets-command-builder';
import { incorrectOptionsTestCases } from './incorrect-options/incorrect-options-test-cases';
import { incorrectConfigurationTestCases } from './incorrect-configuration/incorrect-configuration-test-cases';
import { anything, deepEqual, instance, mock, verify as tsMockitoVerify, when } from 'ts-mockito';
import { ResolveSecretsOptions } from '../../commands/resolve-secrets-command/models/resolve-secrets-options';
import { IFilesHandler } from '../../core/services/files-handler';
import { IKeyVaultService } from '../../commands/generate-token-command/services/key-vault-service';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Resolve secrets command', () => {
  incorrectOptionsTestCases.forEach((testCase) => {
    it(`should return validation errors when incorrect options - test case: ${testCase.testCaseId}, options: '${JSON.stringify(testCase.options)}'`, async () => {
      try {
        const command = buildResolveSecretsCommand(testCase.filesHandler);
        await command.runAsync(testCase.options);
        fail('Validation should throw an exception');
      } catch (error) {
        expect((error as Error)?.message ?? '').toBe(testCase.expectedErrorMessage);
      }
    });
  });

  incorrectConfigurationTestCases.forEach((testCase) => {
    it(`should return validation errors when incorrect configuration - test case ${testCase.testCaseId}`, async () => {
      try {
        const command = buildResolveSecretsCommand(testCase.filesHandler);
        await command.runAsync(testCase.options);
        fail('Validation should throw an exception');
      } catch (error) {
        expect((error as Error)?.message ?? '').toBe(testCase.expectedErrorMessage);
      }
    });
  });

  it('should resolve secrets and write to output file', async () => {
    const options: ResolveSecretsOptions = {
      configFilePath: './test/test-config.json',
      env: 'dev',
      outputFilePath: './test/output.json',
    };

    const configuration = fs.readFileSync(__dirname + '/correct/test-case-1-config.json', 'utf-8');

    const mockedFilesHandler = mock<IFilesHandler>();
    when(mockedFilesHandler.exists(options.configFilePath)).thenReturn(true);
    when(mockedFilesHandler.read(options.configFilePath)).thenReturn(configuration);
    when(mockedFilesHandler.exists(options.outputFilePath)).thenReturn(false);
    const filesHandler = instance(mockedFilesHandler);

    const resolvedSecrets: Record<string, string> = {
      "'key1'": 'secret-value-1',
      "'key2'": 'secret-value-2',
    };
    const mockedKeyVaultService = mock<IKeyVaultService>();
    when(
      mockedKeyVaultService.resolveSecrets(
        'https://my-vault.vault.azure.net',
        deepEqual({ "'key1'": 'secret-1', "'key2'": 'secret-2' }),
      ),
    ).thenResolve(resolvedSecrets);
    const keyVaultService = instance(mockedKeyVaultService);

    const command = buildResolveSecretsCommand(filesHandler, null, keyVaultService);
    await command.runAsync(options);

    const expectedJson = JSON.stringify({ key1: 'secret-value-1', key2: 'secret-value-2' }, null, 2);
    tsMockitoVerify(mockedFilesHandler.write(options.outputFilePath, expectedJson)).once();
  });

  it('should resolve secrets with {env} substitution in output key paths', async () => {
    const options: ResolveSecretsOptions = {
      configFilePath: './test/test-config.json',
      env: 'dev',
      outputFilePath: './test/output.json',
    };

    const configuration = fs.readFileSync(__dirname + '/correct/test-case-2-config.json', 'utf-8');

    const mockedFilesHandler = mock<IFilesHandler>();
    when(mockedFilesHandler.exists(options.configFilePath)).thenReturn(true);
    when(mockedFilesHandler.read(options.configFilePath)).thenReturn(configuration);
    when(mockedFilesHandler.exists(options.outputFilePath)).thenReturn(false);
    const filesHandler = instance(mockedFilesHandler);

    const resolvedSecrets: Record<string, string> = {
      "'settings'.'{env}'.'apiKey'": 'my-api-key',
      "'settings'.'{env}'.'connectionString'": 'my-conn-string',
    };
    const mockedKeyVaultService = mock<IKeyVaultService>();
    when(
      mockedKeyVaultService.resolveSecrets(
        'https://my-vault.vault.azure.net',
        deepEqual({
          "'settings'.'{env}'.'apiKey'": 'api-key-secret',
          "'settings'.'{env}'.'connectionString'": 'conn-string-secret',
        }),
      ),
    ).thenResolve(resolvedSecrets);
    const keyVaultService = instance(mockedKeyVaultService);

    const command = buildResolveSecretsCommand(filesHandler, null, keyVaultService);
    await command.runAsync(options);

    const expectedJson = JSON.stringify(
      { settings: { dev: { apiKey: 'my-api-key', connectionString: 'my-conn-string' } } },
      null,
      2,
    );
    tsMockitoVerify(mockedFilesHandler.write(options.outputFilePath, expectedJson)).once();
  });

  it('should use Windows line endings when outputFileWinNewLineChar is set', async () => {
    const options: ResolveSecretsOptions = {
      configFilePath: './test/test-config.json',
      env: 'dev',
      outputFilePath: './test/output.json',
      outputFileWinNewLineChar: true,
    };

    const configuration = fs.readFileSync(__dirname + '/correct/test-case-1-config.json', 'utf-8');

    const mockedFilesHandler = mock<IFilesHandler>();
    when(mockedFilesHandler.exists(options.configFilePath)).thenReturn(true);
    when(mockedFilesHandler.read(options.configFilePath)).thenReturn(configuration);
    when(mockedFilesHandler.exists(options.outputFilePath)).thenReturn(false);
    const filesHandler = instance(mockedFilesHandler);

    const resolvedSecrets: Record<string, string> = {
      "'key1'": 'secret-value-1',
      "'key2'": 'secret-value-2',
    };
    const mockedKeyVaultService = mock<IKeyVaultService>();
    when(mockedKeyVaultService.resolveSecrets(anything(), anything())).thenResolve(resolvedSecrets);
    const keyVaultService = instance(mockedKeyVaultService);

    const command = buildResolveSecretsCommand(filesHandler, null, keyVaultService);
    await command.runAsync(options);

    const expectedJson = JSON.stringify({ key1: 'secret-value-1', key2: 'secret-value-2' }, null, 2).replaceAll(
      '\n',
      '\r\n',
    );
    tsMockitoVerify(mockedFilesHandler.write(options.outputFilePath, expectedJson)).once();
  });

  it('should merge with existing output file', async () => {
    const options: ResolveSecretsOptions = {
      configFilePath: './test/test-config.json',
      env: 'dev',
      outputFilePath: './test/output.json',
    };

    const configuration = fs.readFileSync(__dirname + '/correct/test-case-1-config.json', 'utf-8');
    const existingOutput = JSON.stringify({ existingKey: 'existingValue' }, null, 2);

    const mockedFilesHandler = mock<IFilesHandler>();
    when(mockedFilesHandler.exists(options.configFilePath)).thenReturn(true);
    when(mockedFilesHandler.read(options.configFilePath)).thenReturn(configuration);
    when(mockedFilesHandler.exists(options.outputFilePath)).thenReturn(true);
    when(mockedFilesHandler.read(options.outputFilePath)).thenReturn(existingOutput);
    const filesHandler = instance(mockedFilesHandler);

    const resolvedSecrets: Record<string, string> = {
      "'key1'": 'secret-value-1',
    };
    const mockedKeyVaultService = mock<IKeyVaultService>();
    when(mockedKeyVaultService.resolveSecrets(anything(), anything())).thenResolve(resolvedSecrets);
    const keyVaultService = instance(mockedKeyVaultService);

    const command = buildResolveSecretsCommand(filesHandler, null, keyVaultService);
    await command.runAsync(options);

    const expectedJson = JSON.stringify({ existingKey: 'existingValue', key1: 'secret-value-1' }, null, 2);
    tsMockitoVerify(mockedFilesHandler.write(options.outputFilePath, expectedJson)).once();
  });
});
