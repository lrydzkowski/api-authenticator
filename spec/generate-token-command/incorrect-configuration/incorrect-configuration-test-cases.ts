import { instance, mock, when } from 'ts-mockito';
import { FilesHandler, IFilesHandler } from '../../../core/services/files-handler';
import { GenerateTokenOptions } from '../../../commands/generate-token-command/models/generate-token-options';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const correctOptions: GenerateTokenOptions = {
  configFilePath: './test/test-config.json',
  env: 'app - dev',
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
  options: GenerateTokenOptions;
  configuration: string;
  filesHandler: IFilesHandler;
  expectedErrorMessage: string;
}

export const incorrectConfigurationTestCase: IncorrectConfigurationTestCase[] = [
  buildTestCase(1, __dirname + '/test-case-1.json', __dirname + '/results/test-case-1.approved.txt'),
  buildTestCase(2, __dirname + '/test-case-2.json', __dirname + '/results/test-case-2.approved.txt'),
  buildTestCase(3, __dirname + '/test-case-3.json', __dirname + '/results/test-case-3.approved.txt'),
  buildTestCase(4, __dirname + '/test-case-4.json', __dirname + '/results/test-case-4.approved.txt'),
  buildTestCase(5, __dirname + '/test-case-5.json', __dirname + '/results/test-case-5.approved.txt'),
  buildTestCase(6, __dirname + '/test-case-6.json', __dirname + '/results/test-case-6.approved.txt'),
  buildTestCase(7, __dirname + '/test-case-7.json', __dirname + '/results/test-case-7.approved.txt'),
  buildTestCase(8, __dirname + '/test-case-8.json', __dirname + '/results/test-case-8.approved.txt'),
  buildTestCase(9, __dirname + '/test-case-9.json', __dirname + '/results/test-case-9.approved.txt'),
  buildTestCase(10, __dirname + '/test-case-10.json', __dirname + '/results/test-case-10.approved.txt'),
];
