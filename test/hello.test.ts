import { Hello } from "../src";

test("hello", () => {
  console.log('check');
  expect(new Hello().sayHello()).toBe("hello, world!");
});
