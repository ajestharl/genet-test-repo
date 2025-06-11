// import { spawn } from 'child_process';
import { displayBooks } from '../src/index';

describe('displayBooks', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('displays books in numbered format', async () => {
    const mockBooks = ['Book 1', 'Book 2', 'Book 3'];
    const mockListBooks = jest.fn().mockResolvedValue(mockBooks);

    await displayBooks({ listBooks: mockListBooks });

    expect(consoleSpy).toHaveBeenCalledWith('\nAvailable books:');
    expect(consoleSpy).toHaveBeenCalledWith('1. Book 1');
    expect(consoleSpy).toHaveBeenCalledWith('2. Book 2');
    expect(consoleSpy).toHaveBeenCalledWith('3. Book 3');
    expect(consoleSpy).toHaveBeenCalledWith('\nTotal books found: 3\n');
  });

  test('throws error when no books found', async () => {
    const mockListBooks = jest.fn().mockResolvedValue([]);

    await expect(displayBooks({ listBooks: mockListBooks })).rejects.toThrow(
      'No books found in the library',
    );
  });
});

