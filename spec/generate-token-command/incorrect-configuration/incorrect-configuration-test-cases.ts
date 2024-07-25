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

const buildTestCase = (testCaseId: number, configurationFilePath: string): IncorrectConfigurationTestCase => {
  const configuration = fs.readFileSync(configurationFilePath, 'utf-8');

  return {
    testCaseId,
    options: correctOptions,
    configuration,
    filesHandler: mockFilesHandler(configuration),
  };
};

interface IncorrectConfigurationTestCase {
  testCaseId: number;
  options: GenerateTokenOptions;
  configuration: string;
  filesHandler: IFilesHandler;
}

export const incorrectConfigurationTestCase: IncorrectConfigurationTestCase[] = [
  buildTestCase(1, __dirname + '/test-case-1.json'),
  buildTestCase(2, __dirname + '/test-case-2.json'),
  buildTestCase(3, __dirname + '/test-case-3.json'),
  buildTestCase(4, __dirname + '/test-case-4.json'),
  buildTestCase(5, __dirname + '/test-case-5.json'),
  buildTestCase(6, __dirname + '/test-case-6.json'),
  buildTestCase(7, __dirname + '/test-case-7.json'),
  buildTestCase(8, __dirname + '/test-case-8.json'),
  buildTestCase(9, __dirname + '/test-case-9.json'),
  buildTestCase(10, __dirname + '/test-case-10.json'),
];
