import { asValue, appContainer } from "@omniflex/core/containers";

describe('AppContainer', () => {
  beforeEach(() => {
    appContainer.dispose(); // Clear registrations
  });

  test('asValue registers value correctly', () => {
    const testValue = { test: true };
    asValue('uniqueKey1', testValue);
    const resolved = appContainer.resolve('uniqueKey1');
    expect(resolved).toEqual(testValue);
  });

  test('asValue cannot override existing registration', () => {
    const original = { original: true };
    const override = { override: true };

    asValue('uniqueKey2', original);
    asValue('uniqueKey2', override);

    const resolved = appContainer.resolve('uniqueKey2');
    expect(resolved).toEqual(original);
  });
});