import { buildGenerateTokenCommand } from '../../commands/generate-token-command/generate-token-command-builder';
import { verify } from 'approvals';
import { incorrectOptionsTestCases } from './incorrect-options/incorrect-options-test-cases';
import { incorrectConfigurationTestCase } from './incorrect-configuration/incorrect-configuration-test-cases';
import { Tokens } from '../../commands/generate-token-command/models/tokens';
import { anything, deepEqual, instance, mock, verify as tsMockitoVerify, when } from 'ts-mockito';
import { GenerateTokenOptions } from '../../commands/generate-token-command/models/generate-token-options';
import { IFilesHandler } from '../../core/services/files-handler';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IAuthHandler } from '../../commands/generate-token-command/services/auth-handlers/auth-handler';
import { IOutputHandler } from '../../commands/generate-token-command/services/output-handlers/output-handler';
import { FileOutputHandler } from '../../commands/generate-token-command/services/output-handlers/file-output-handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Generate token command', () => {
  incorrectOptionsTestCases.forEach((testCase) => {
    it(`should return validation errors when incorrect options - test case: ${testCase.testCaseId}, options: '${JSON.stringify(testCase.options)}'`, async () => {
      try {
        const generateTokenCommand = buildGenerateTokenCommand(testCase.filesHandler);
        await generateTokenCommand.runAsync(testCase.options);
        fail('Validation should throw an exception');
      } catch (error) {
        verify(
          `${import.meta.dirname}/incorrect-options/results`,
          `test-case-${testCase.testCaseId}`,
          (error as Error)?.message ?? '',
        );
      }
    });
  });

  incorrectConfigurationTestCase.forEach((testCase) => {
    it(`should return validation errors when incorrect configuration - test case ${testCase.testCaseId}`, async () => {
      try {
        const generateTokenCommand = buildGenerateTokenCommand(testCase.filesHandler);
        await generateTokenCommand.runAsync(testCase.options);
        fail('Validation should throw an exception');
      } catch (error) {
        verify(
          `${import.meta.dirname}/incorrect-configuration/results`,
          `test-case-${testCase.testCaseId}`,
          (error as Error)?.message ?? '',
        );
      }
    });
  });

  it(`should show tokens in console when authorization code flow is used`, async () => {
    const tokens: Tokens = {
      accessToken: 'accessTokenTest',
      refreshToken: 'refreshTokenTest',
    };

    const correctOptions: GenerateTokenOptions = {
      configFilePath: './test/test-config.json',
      env: 'app - dev',
    };

    const configuration = fs.readFileSync(__dirname + '/correct/test-case-1-config.json', 'utf-8');

    const mockedFilesHandler = mock<IFilesHandler>();
    when(mockedFilesHandler.exists(correctOptions.configFilePath)).thenReturn(true);
    when(mockedFilesHandler.read(correctOptions.configFilePath)).thenReturn(configuration);
    const filesHandler = instance(mockedFilesHandler);

    const mockedAuthHandler = mock<IAuthHandler>();
    when(mockedAuthHandler.getTokensAsync(anything(), anything())).thenResolve(tokens);
    const authHandler = instance(mockedAuthHandler);

    const mockedOutputHandler = mock<IOutputHandler>();
    const outputHandler = instance(mockedOutputHandler);

    const generateTokenCommand = buildGenerateTokenCommand(filesHandler, authHandler, null, null, outputHandler);
    await generateTokenCommand.runAsync(correctOptions);

    const expectedOptions: GenerateTokenOptions = JSON.parse(JSON.stringify(correctOptions));
    const expectedTokens: Tokens = JSON.parse(JSON.stringify(tokens));
    tsMockitoVerify(mockedOutputHandler.handleOutput(deepEqual(expectedOptions), deepEqual(expectedTokens))).once();
  });

  it(`should show tokens in console when client credentials flow is used`, async () => {
    const tokens: Tokens = {
      accessToken: 'accessTokenTest',
      refreshToken: 'refreshTokenTest',
    };

    const correctOptions: GenerateTokenOptions = {
      configFilePath: './test/test-config.json',
      env: 'app - dev',
    };

    const configuration = fs.readFileSync(__dirname + '/correct/test-case-2-config.json', 'utf-8');

    const mockedFilesHandler = mock<IFilesHandler>();
    when(mockedFilesHandler.exists(correctOptions.configFilePath)).thenReturn(true);
    when(mockedFilesHandler.read(correctOptions.configFilePath)).thenReturn(configuration);
    const filesHandler = instance(mockedFilesHandler);

    const mockedAuthHandler = mock<IAuthHandler>();
    when(mockedAuthHandler.getTokensAsync(anything(), anything())).thenResolve(tokens);
    const authHandler = instance(mockedAuthHandler);

    const mockedOutputHandler = mock<IOutputHandler>();
    const outputHandler = instance(mockedOutputHandler);

    const generateTokenCommand = buildGenerateTokenCommand(filesHandler, null, authHandler, null, outputHandler);
    await generateTokenCommand.runAsync(correctOptions);

    const expectedOptions: GenerateTokenOptions = JSON.parse(JSON.stringify(correctOptions));
    const expectedTokens: Tokens = JSON.parse(JSON.stringify(tokens));
    tsMockitoVerify(mockedOutputHandler.handleOutput(deepEqual(expectedOptions), deepEqual(expectedTokens))).once();
  });

  it(`should write tokens to an output file when authorization code flow is used`, async () => {
    const tokens: Tokens = {
      accessToken: 'accessTokenTest',
      refreshToken: 'refreshTokenTest',
    };
    const expectedTokens: Tokens = JSON.parse(JSON.stringify(tokens));
    expectedTokens.accessToken = `Bearer ${expectedTokens.accessToken}`;

    const correctOptions: GenerateTokenOptions = {
      configFilePath: './test/test-config.json',
      env: 'app - dev',
      addPrefixToAccessToken: true,
      outputFilePath: './test/test-output.json',
      outputFileAccessTokenKey: "'test1'.{env}.'accessToken'",
      outputFileRefreshTokenKey: "'test1'.{env}.'refreshToken'",
      outputFileWinNewLineChar: true,
    };
    const expectedOptions: GenerateTokenOptions = JSON.parse(JSON.stringify(correctOptions));

    const configuration = fs.readFileSync(__dirname + '/correct/test-case-3-config.json', 'utf-8');

    const mockedFilesHandler = mock<IFilesHandler>();
    when(mockedFilesHandler.exists(correctOptions.configFilePath)).thenReturn(true);
    when(mockedFilesHandler.exists(correctOptions.outputFilePath as string)).thenReturn(true);
    when(mockedFilesHandler.read(correctOptions.configFilePath)).thenReturn(configuration);
    const filesHandler = instance(mockedFilesHandler);

    const mockedAuthHandler = mock<IAuthHandler>();
    when(mockedAuthHandler.getTokensAsync(anything(), anything())).thenResolve(tokens);
    const authHandler = instance(mockedAuthHandler);

    const mockedOutputHandler = mock<FileOutputHandler>();
    const optionsForGettingRefreshToken = JSON.parse(JSON.stringify(correctOptions));
    when(mockedOutputHandler.getRefreshToken(deepEqual(optionsForGettingRefreshToken))).thenReturn(tokens.refreshToken);
    const outputHandler = instance(mockedOutputHandler);

    const generateTokenCommand = buildGenerateTokenCommand(filesHandler, authHandler, null, outputHandler, null);
    await generateTokenCommand.runAsync(correctOptions);

    tsMockitoVerify(mockedOutputHandler.handleOutput(deepEqual(expectedOptions), deepEqual(expectedTokens))).once();
  });
});
