#!/usr/bin/env node

/**
 * Returns a list of movies
 * @returns Array of movie titles
 */
export const listMoviesImpl = async (): Promise<string[]> => {
  return ['The Shawshank Redemption', 'The Godfather', 'The Dark Knight'];
};

export type DisplayMovies = ({
  listMovies,
}: {
  listMovies?: () => Promise<string[]>;
}) => Promise<void>;

/**
 * Displays a list of movies in a numbered format.
 *
 * @param listMovies Function that fetches the list of movies
 */
export const displayMovies: DisplayMovies = async ({
  listMovies = listMoviesImpl,
}) => {
  try {
    const movies = await listMovies();
    if (movies.length === 0) {
      throw new Error('No movies found in the library');
    }
    console.log('\nAvailable movies:');
    movies.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    console.log(`\nTotal movies found: ${movies.length}\n`);
  } catch (error) {
    throw error;
  }
};