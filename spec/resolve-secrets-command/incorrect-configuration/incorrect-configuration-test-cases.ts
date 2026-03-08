import { instance, mock, when } from 'ts-mockito';
import { FilesHandler, IFilesHandler } from '../../../core/services/files-handler';
import { ResolveSecretsOptions } from '../../../commands/resolve-secrets-command/models/resolve-secrets-options';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const correctOptions: ResolveSecretsOptions = {
  configFilePath: './test/test-config.json',
  env: 'dev',
  outputFilePath: './test/output.json',
};

const mockFilesHandler = (configuration: string): IFilesHandler => {
  const mockedFilesHandler = mock(FilesHandler);
  when(mockedFilesHandler.exists(correctOptions.configFilePath)).thenReturn(true);
  when(mockedFilesHandler.read(correctOptions.configFilePath)).thenReturn(configuration);
  const filesHandler = instance(mockedFilesHandler);

  return filesHandler;
};

const buildTestCase = (
  testCaseId: number,
  configurationFilePath: string,
  expectedErrorMessageFilePath: string,
): IncorrectConfigurationTestCase => {
  const configuration = fs.readFileSync(configurationFilePath, 'utf-8');
  const expectedErrorMessage = fs.readFileSync(expectedErrorMessageFilePath, 'utf-8')?.trim() ?? '';

  return {
    testCaseId,
    options: correctOptions,
    configuration,
    filesHandler: mockFilesHandler(configuration),
    expectedErrorMessage,
  };
};

interface IncorrectConfigurationTestCase {
  testCaseId: number;
  options: ResolveSecretsOptions;
  configuration: string;
  filesHandler: IFilesHandler;
  expectedErrorMessage: string;
}

export const incorrectConfigurationTestCases: IncorrectConfigurationTestCase[] = [
  buildTestCase(1, __dirname + '/test-case-1.json', __dirname + '/results/test-case-1.approved.txt'),
  buildTestCase(2, __dirname + '/test-case-2.json', __dirname + '/results/test-case-2.approved.txt'),
  buildTestCase(3, __dirname + '/test-case-3.json', __dirname + '/results/test-case-3.approved.txt'),
  buildTestCase(4, __dirname + '/test-case-4.json', __dirname + '/results/test-case-4.approved.txt'),
];
