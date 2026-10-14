import { cached, clearCache } from '../cache.ts';

beforeEach(() => {
  clearCache();
});

describe('cached', () => {
  test('a second call within the ttl does not load again', async () => {
    let calls = 0;
    const load = async () => {
      calls++;
      return 'data';
    };
    const now = () => 1000;

    expect(await cached('a', 500, load, now)).toBe('data');
    expect(await cached('a', 500, load, now)).toBe('data');
    expect(calls).toBe(1);
  });

  test('after the ttl it loads again', async () => {
    let calls = 0;
    let time = 1000;
    const load = async () => {
      calls++;
      return calls;
    };
    const now = () => time;

    await cached('a', 500, load, now);
    time = 1600;
    expect(await cached('a', 500, load, now)).toBe(2);
  });

  test('two calls at the same time share one request', async () => {
    let calls = 0;
    const load = async () => {
      calls++;
      return 'data';
    };

    await Promise.all([cached('a', 500, load), cached('a', 500, load)]);
    expect(calls).toBe(1);
  });

  test('a failed load is not cached', async () => {
    let calls = 0;
    const load = async () => {
      calls++;
      if (calls === 1) {
        throw new Error('offline');
      }
      return 'data';
    };

    await expect(cached('a', 500, load)).rejects.toThrow('offline');
    expect(await cached('a', 500, load)).toBe('data');
  });
});
