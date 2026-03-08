import { mock, when, instance } from 'ts-mockito';
import { ResolveSecretsOptions } from '../../../commands/resolve-secrets-command/models/resolve-secrets-options';
import { FilesHandler, IFilesHandler } from '../../../core/services/files-handler';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockFilesHandler = (configFilePath: string, configFilePathExists: boolean): IFilesHandler => {
  const mockedFilesHandler = mock(FilesHandler);
  when(mockedFilesHandler.exists(configFilePath)).thenReturn(configFilePathExists);
  const filesHandler = instance(mockedFilesHandler);

  return filesHandler;
};

const correctOptions: ResolveSecretsOptions = {
  configFilePath: './test/test-config.json',
  env: 'dev',
  outputFilePath: './test/output.json',
};

const buildTestCase = (
  testCaseId: number,
  options: ResolveSecretsOptions,
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
  options: ResolveSecretsOptions;
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
      outputFilePath: '',
    },
    mockFilesHandler(correctOptions.configFilePath, true),
    __dirname + '/results/test-case-3.approved.txt',
  ),
];
