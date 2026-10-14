import { TmdbError, describeTmdbError } from '../client';

describe('describeTmdbError', () => {
  test('401 means the token is wrong', () => {
    expect(describeTmdbError(new TmdbError(401))).toBe(
      'TMDB rejected the token. Check src/config/secrets.ts.',
    );
  });

  test('other TmdbError shows the status', () => {
    expect(describeTmdbError(new TmdbError(500))).toBe(
      'TMDB had a problem (500). Try again later.',
    );
  });

  test('anything else is a connection problem', () => {
    expect(describeTmdbError(new TypeError('Network request failed'))).toBe(
      'Could not reach TMDB. Check your connection.',
    );
  });
});
