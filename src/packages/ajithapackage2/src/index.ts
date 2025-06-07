/**
 * Represents a book with basic details
 */
interface Book {
  title: string;
  author: string;
  category: string;
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
 * Lists books in a numbered format and shows the total count.
 *
 * ---
 * dependency injection parameters:
 *
 * @param listBooks Function that fetches the list of books
 *
 * @example
 * // Output:
 * // Available Books:
 * // 1. The Great Gatsby by F. Scott Fitzgerald (Fiction)
 * // 2. 1984 by George Orwell (Fiction)
 * // Total books found: 2
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

if (require.main === module) {
  displayBooks({}).catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
