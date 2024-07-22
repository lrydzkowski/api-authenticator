import { mock, when, instance } from 'ts-mockito';
import { GenerateTokenOptions } from '../../../commands/generate-token-command/models/generate-token-options';
import { FilesHandler, IFilesHandler } from '../../../core/services/files-handler';

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

interface IncorrectOptionsTestCase {
  testCaseId: number;
  options: GenerateTokenOptions;
  filesHandler: IFilesHandler;
}

export const incorrectOptionsTestCases: IncorrectOptionsTestCase[] = [
  {
    testCaseId: 1,
    options: {
      ...correctOptions,
    },
    filesHandler: mockFilesHandler(correctOptions.configFilePath, false),
  },
  {
    testCaseId: 2,
    options: {
      ...correctOptions,
      env: '',
    },
    filesHandler: mockFilesHandler(correctOptions.configFilePath, false),
  },
  {
    testCaseId: 3,
    options: {
      ...correctOptions,
      outputFilePath: './test.json',
    },
    filesHandler: mockFilesHandler(correctOptions.configFilePath, true, './test.json', false),
  },
  {
    testCaseId: 4,
    options: {
      ...correctOptions,
      outputFilePath: './test.json',
      outputFileAccessTokenKey: undefined,
    },
    filesHandler: mockFilesHandler(correctOptions.configFilePath, true, './test.json', true),
  },
  {
    testCaseId: 5,
    options: {
      ...correctOptions,
      outputFilePath: './test.json',
      outputFileAccessTokenKey: '',
    },
    filesHandler: mockFilesHandler(correctOptions.configFilePath, true, './test.json', true),
  },
  {
    testCaseId: 6,
    options: {
      ...correctOptions,
      outputFilePath: './test.json',
      outputFileAccessTokenKey: "'test'.'test2'",
      outputFileRefreshTokenKey: undefined,
    },
    filesHandler: mockFilesHandler(correctOptions.configFilePath, true, './test.json', true),
  },
  {
    testCaseId: 7,
    options: {
      ...correctOptions,
      outputFilePath: './test.json',
      outputFileAccessTokenKey: "'test'.'test2'",
      outputFileRefreshTokenKey: '',
    },
    filesHandler: mockFilesHandler(correctOptions.configFilePath, true, './test.json', true),
  },
];
