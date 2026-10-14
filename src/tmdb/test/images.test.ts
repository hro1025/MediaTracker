import { posterUrl } from '../images';

describe('posterUrl', () => {
  test('builds a w342 poster URL', () => {
    expect(posterUrl('/abc.jpg', 'w342')).toBe(
      'https://image.tmdb.org/t/p/w342/abc.jpg',
    );
  });

  test('builds a w185 poster URL', () => {
    expect(posterUrl('/abc.jpg', 'w185')).toBe(
      'https://image.tmdb.org/t/p/w185/abc.jpg',
    );
  });

  test('returns null when there is no poster', () => {
    expect(posterUrl(null, 'w342')).toBeNull();
  });
});
