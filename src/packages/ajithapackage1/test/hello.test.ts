import { Hello } from '../src/hello';

test('hello', () => {
  expect(new Hello().sayHello()).toBe('hello, world!');
});
