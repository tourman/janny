import { type CaseGenerator } from 'features/CaseGenerator';

export interface KeepAndRetryPromiseFactoryOptions {
  retry?: number;
}

export function keepAndRetryPromiseFactory<T>(
  options?: KeepAndRetryPromiseFactoryOptions,
) {
  const { retry } = { retry: 0, ...options };
  let promise: Promise<T> | null = null;
  function keepAndRetryPromise(getPromise: () => Promise<T>): Promise<T> {
    if (promise === null) {
      promise = getPromise();
      for (let i = 0; i < retry; i++) {
        promise = promise?.catch(getPromise);
      }
    }
    return promise;
  }
  const keepAndRetry =
    keepAndRetryPromise satisfies CaseGenerator.ManagePromise<T>;
  return keepAndRetry;
}
