import { buildGenerateTokenCommand } from '../../commands/generate-token-command/generate-token-command-builder';
import { verify } from 'approvals';
import { incorrectOptionsTestCases } from './incorrect-options/incorrect-options-test-cases';
import { incorrectConfigurationTestCase } from './incorrect-configuration/incorrect-configuration-test-cases';

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
    it(`should return validation errors when incorrect configuration - test case ${testCase.testCaseId}, configuration '${testCase.configuration}'`, async () => {
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
});
