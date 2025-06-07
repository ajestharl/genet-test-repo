#!/usr/bin/env node

import { Command } from 'commander';

/**
 * Represents a book with basic details
 */
interface Book {
  title: string;
  author: string;
  category: string;
}

/**
 * Command options interface
 */
interface ListCommandOptions {
  category?: string;
  author?: string;
}

/**
 * Returns a list of books
 * @returns Array of books
 */
export const listBooksImpl = async (): Promise<Book[]> => {
  // Simulated data - could be replaced with actual data source
  return [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      category: 'Fiction',
    },
    {
      title: '1984',
      author: 'George Orwell',
      category: 'Fiction',
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      category: 'Science',
    },
  ];
};

export type DisplayBooks = ({
  listBooks,
}: {
  listBooks?: () => Promise<Book[]>;
}) => Promise<void>;

/**
 * Displays a list of books with their authors and categories.
 */
export const displayBooks: DisplayBooks = async ({
  listBooks = listBooksImpl,
}) => {
  try {
    const books = await listBooks();
    if (books.length === 0) {
      throw new Error('No books found in the library');
    }
    console.log('\nAvailable Books:');
    books.forEach((book, index) => {
      console.log(
        `${index + 1}. ${book.title} by ${book.author} (${book.category})`,
      );
    });
    console.log(`\nTotal books found: ${books.length}\n`);
  } catch (error) {
    throw error;
  }
};

/**
 * Creates and configures the CLI program
 */
export const createCli = (): Command => {
  const program = new Command();

  program
    .name('ajitha-cli')
    .description('CLI tool for managing books')
    .version('1.0.0');

  // List all books command
  program
    .command('list')
    .description('List all available books')
    .option('-c, --category <category>', 'Filter books by category')
    .option('-a, --author <author>', 'Filter books by author')
    .action(async (options: ListCommandOptions) => {
      try {
        const books = await listBooksImpl();
        let filteredBooks = books;

        if (options.category) {
          filteredBooks = filteredBooks.filter(
            (book) =>
              book.category.toLowerCase() === options.category!.toLowerCase(),
          );
        }

        if (options.author) {
          filteredBooks = filteredBooks.filter((book) =>
            book.author.toLowerCase().includes(options.author!.toLowerCase()),
          );
        }

        if (filteredBooks.length === 0) {
          console.log('No books found matching your criteria.');
          return;
        }

        console.log('\nAvailable Books:');
        filteredBooks.forEach((book, index) => {
          console.log(
            `${index + 1}. ${book.title} by ${book.author} (${book.category})`,
          );
        });
        console.log(`\nTotal books found: ${filteredBooks.length}\n`);
      } catch (error) {
        console.error(
          'Error:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        process.exit(1);
      }
    });

  // Show categories command
  program
    .command('categories')
    .description('List all available book categories')
    .action(async () => {
      try {
        const books = await listBooksImpl();
        const categories = [...new Set(books.map((book) => book.category))];
        console.log('\nAvailable Categories:');
        categories.forEach((category, index) => {
          console.log(`${index + 1}. ${category}`);
        });
        console.log();
      } catch (error) {
        console.error(
          'Error:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        process.exit(1);
      }
    });

  // Show authors command
  program
    .command('authors')
    .description('List all authors')
    .action(async () => {
      try {
        const books = await listBooksImpl();
        const authors = [...new Set(books.map((book) => book.author))];
        console.log('\nAvailable Authors:');
        authors.forEach((author, index) => {
          console.log(`${index + 1}. ${author}`);
        });
        console.log();
      } catch (error) {
        console.error(
          'Error:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        process.exit(1);
      }
    });

  return program;
};

// Only run the CLI when the file is being executed directly
if (require.main === module) {
  const program = createCli();
  program.parse(process.argv);
}
