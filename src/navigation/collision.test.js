import test from 'node:test';
import assert from 'node:assert/strict';
import { isWalkable, moveWithCollision, canInteractWithDoor } from './collision.js';

test('player starts inside allowed room', () => {
  assert.equal(isWalkable(0, 1), true);
});
test('closed door blocks corridor', () => {
  assert.equal(isWalkable(0, -3.4, { doorOpen: false }), false);
  assert.equal(isWalkable(0, -3.4, { doorOpen: true }), true);
});
test('open passage allows crossing seam without gaps', () => {
  for (const z of [-2.8, -2.95, -3.0, -3.1, -3.6]) {
    assert.equal(isWalkable(0, z, { doorOpen: true }), true);
  }
});
test('room boundaries and furniture are solid', () => {
  assert.equal(isWalkable(4, 0), false);
  assert.equal(isWalkable(-2, 1.5), false);
  assert.equal(isWalkable(1.6, 0.1), false);
});
test('wall movement does not exit room', () => {
  const end = moveWithCollision({ x: 3, z: 0 }, 5, 0);
  assert.ok(end.x <= 3.76 && end.x > 3);
});
test('large movement cannot tunnel through furniture', () => {
  const end = moveWithCollision({ x: 0, z: 0.3 }, 3, 0);
  assert.ok(end.x < 0.85);
});
test('interaction requires proximity to doorway', () => {
  assert.equal(canInteractWithDoor({ x: 0, z: -1.5 }), true);
  assert.equal(canInteractWithDoor({ x: 0, z: 1 }), false);
});
