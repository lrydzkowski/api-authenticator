import { mock, when, instance } from 'ts-mockito';
import { GenerateTokenOptions } from '../../../commands/generate-token-command/models/generate-token-options';
import { FilesHandler, IFilesHandler } from '../../../core/services/files-handler';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockFilesHandler = (
  configFilePath: string,
  configFilePathExists: boolean,
  outputFilePath: string | null = null,
  outputFilePathExists: boolean = false,
): IFilesHandler => {
  const mockedFilesHandler = mock(FilesHandler);
  when(mockedFilesHandler.exists(configFilePath)).thenReturn(configFilePathExists);
  if (outputFilePath) {
    when(mockedFilesHandler.exists(outputFilePath)).thenReturn(outputFilePathExists);
  }
  const filesHandler = instance(mockedFilesHandler);

  return filesHandler;
};

const correctOptions: GenerateTokenOptions = {
  configFilePath: './test/test-config.json',
  env: 'dev',
};

const buildTestCase = (
  testCaseId: number,
  options: GenerateTokenOptions,
  filesHandler: IFilesHandler,
  expectedErrorMessageFilePath: string,
): IncorrectOptionsTestCase => {
  const expectedErrorMessage = fs.readFileSync(expectedErrorMessageFilePath, 'utf-8')?.trim() ?? '';

  return {
    testCaseId,
    options,
    filesHandler,
    expectedErrorMessage,
  };
};

interface IncorrectOptionsTestCase {
  testCaseId: number;
  options: GenerateTokenOptions;
  filesHandler: IFilesHandler;
  expectedErrorMessage: string;
}

export const incorrectOptionsTestCases: IncorrectOptionsTestCase[] = [
  buildTestCase(
    1,
    {
      ...correctOptions,
    },
    mockFilesHandler(correctOptions.configFilePath, false),
    __dirname + '/results/test-case-1.approved.txt',
  ),
  buildTestCase(
    2,
    {
      ...correctOptions,
      env: '',
    },
    mockFilesHandler(correctOptions.configFilePath, false),
    __dirname + '/results/test-case-2.approved.txt',
  ),
  buildTestCase(
    3,
    {
      ...correctOptions,
      outputFilePath: './test.json',
    },
    mockFilesHandler(correctOptions.configFilePath, true, './test.json', false),
    __dirname + '/results/test-case-3.approved.txt',
  ),
  buildTestCase(
    4,
    {
      ...correctOptions,
      outputFilePath: './test.json',
      outputFileAccessTokenKey: undefined,
    },
    mockFilesHandler(correctOptions.configFilePath, true, './test.json', true),
    __dirname + '/results/test-case-4.approved.txt',
  ),
  buildTestCase(
    5,
    {
      ...correctOptions,
      outputFilePath: './test.json',
      outputFileAccessTokenKey: '',
    },
    mockFilesHandler(correctOptions.configFilePath, true, './test.json', true),
    __dirname + '/results/test-case-5.approved.txt',
  ),
  buildTestCase(
    6,
    {
      ...correctOptions,
      outputFilePath: './test.json',
      outputFileAccessTokenKey: "'test'.'test2'",
      outputFileRefreshTokenKey: undefined,
    },
    mockFilesHandler(correctOptions.configFilePath, true, './test.json', true),
    __dirname + '/results/test-case-6.approved.txt',
  ),
  buildTestCase(
    7,
    {
      ...correctOptions,
      outputFilePath: './test.json',
      outputFileAccessTokenKey: "'test'.'test2'",
      outputFileRefreshTokenKey: '',
    },
    mockFilesHandler(correctOptions.configFilePath, true, './test.json', true),
    __dirname + '/results/test-case-7.approved.txt',
  ),
];
