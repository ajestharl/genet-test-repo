import { Hello } from '../src/index';

test('hello', () => {
  expect(new Hello().sayHello()).toBe('hello, world!');
});
