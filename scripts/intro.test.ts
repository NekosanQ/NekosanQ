import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateAge } from "./intro.ts";

test("age increments at January 11 midnight in Japan, independently of the host timezone", () => {
  assert.equal(calculateAge(new Date("2026-11-10T00:00:00+09:00")), 19);
  assert.equal(calculateAge(new Date("2027-01-10T14:59:59Z")), 19);
  assert.equal(calculateAge(new Date("2027-01-10T15:00:00Z")), 20);
  assert.equal(calculateAge(new Date("2028-01-10T15:00:00Z")), 21);
});
