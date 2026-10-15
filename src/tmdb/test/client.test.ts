import { TmdbError, describeTmdbError } from '../client';

describe('describeTmdbError', () => {
  test('401 means the token is missing or wrong', () => {
    expect(describeTmdbError(new TmdbError(401))).toBe(
      'No valid TMDB token. Add yours in About (⋮ on the home screen).',
    );
  });

  test('other TmdbError shows the status', () => {
    expect(describeTmdbError(new TmdbError(500))).toBe(
      'TMDB had a problem (500). Try again later.',
    );
  });

  test('anything else is a connection problem', () => {
    expect(
      describeTmdbError(new TypeError('Network request failed')),
    ).toBe('Could not reach TMDB. Check your connection.');
  });
});
