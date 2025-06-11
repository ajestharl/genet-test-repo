#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';

/**
 * Returns a list of books
 * @returns Array of book titles
 */
export const listBooksImpl = async (): Promise<string[]> => {
  return ['Book One', 'Book Two', 'Book Three'];
};

export type DisplayBooks = ({
  listBooks,
}: {
  listBooks?: () => Promise<string[]>;
}) => Promise<void>;

/**
 * Displays a list of books in a numbered format.
 *
 * @param listBooks Function that fetches the list of books
 */
export const displayBooks: DisplayBooks = async ({
  listBooks = listBooksImpl,
}) => {
  try {
    const books = await listBooks();
    if (books.length === 0) {
      throw new Error('No books found in the library');
    }
    console.log('\nAvailable books:');
    books.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    console.log(`\nTotal books found: ${books.length}\n`);
  } catch (error) {
    throw error;
  }
};

export const main = () => {
  const program = new Command();

  program
    .name('display')
    .description('CLI to display available books')
    .version(version)
    .action(async () => {
      try {
        await displayBooks({});
      } catch (error) {
        console.error('Error:', error);
        process.exit(1);
      }
    });

  program.parse(process.argv);
};

if (require.main === module) {
  main();
}
