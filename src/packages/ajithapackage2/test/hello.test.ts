import { displayBooks } from '../src/index'; // Assuming the previous file is named displayBooks.ts

describe('Books Display Tests', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup console.log spy before each test
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Clear console.log spy after each test
    consoleSpy.mockRestore();
  });

  test('should display books with correct formatting', async () => {
    // Arrange
    const mockBooks = [
      {
        title: 'Test Book 1',
        author: 'Author 1',
        category: 'Fiction',
      },
      {
        title: 'Test Book 2',
        author: 'Author 2',
        category: 'Science',
      },
    ];

    const mockListBooks = jest.fn().mockResolvedValue(mockBooks);

    // Act
    await displayBooks({ listBooks: mockListBooks });

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith('\nAvailable Books:');
    expect(consoleSpy).toHaveBeenCalledWith(
      '1. Test Book 1 by Author 1 (Fiction)',
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      '2. Test Book 2 by Author 2 (Science)',
    );
    expect(consoleSpy).toHaveBeenCalledWith('\nTotal books found: 2\n');
  });

  test('should throw error when no books are found', async () => {
    // Arrange
    const mockListBooks = jest.fn().mockResolvedValue([]);

    // Act & Assert
    await expect(displayBooks({ listBooks: mockListBooks })).rejects.toThrow(
      'No books found in the library',
    );
  });
});
