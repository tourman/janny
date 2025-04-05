import { keepAndRetryPromiseFactory } from './keepAndRetryPromise';

describe('keepAndRetryPromise', () => {
  it('should return same fulfilled promise by default', () => {
    const keepAndRetryPromise = keepAndRetryPromiseFactory();
    const promise = Promise.resolve();
    const result = keepAndRetryPromise(() => promise);
    expect(result).toBe(promise);
  });
  it('should return previous fulfilled promise', () => {
    const keepAndRetryPromise = keepAndRetryPromiseFactory();
    const promise = Promise.resolve();
    keepAndRetryPromise(() => promise);
    const result = keepAndRetryPromise(() => Promise.resolve());
    expect(result).toBe(promise);
  });
  it('should not call other promise factory', () => {
    const keepAndRetryPromise = keepAndRetryPromiseFactory();
    const promise = Promise.resolve();
    keepAndRetryPromise(() => promise);
    const factory = jest.fn().mockReturnValue(Promise.resolve());
    keepAndRetryPromise(factory);
    expect(factory).toHaveBeenCalledTimes(0);
  });
  it('should retry promise by calling factory 3 times', async () => {
    const keepAndRetryPromise = keepAndRetryPromiseFactory({ retry: 2 });
    const factory = jest.fn().mockReturnValue(Promise.reject());
    await keepAndRetryPromise(factory).catch(() => null);
    expect(factory).toHaveBeenCalledTimes(3);
  });
  it('should not retry promise', async () => {
    const keepAndRetryPromise = keepAndRetryPromiseFactory();
    const factory = jest.fn().mockReturnValue(Promise.reject());
    await keepAndRetryPromise(factory).catch(() => null);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
