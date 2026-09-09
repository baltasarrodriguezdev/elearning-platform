import test from 'node:test';
import assert from 'node:assert/strict';
import { START, STOPS, ROADS, nextChallenge, canAdvance, measureRoute, pointOnRoute } from './journey.js';
import { UNITS } from './worlds.js';
import { existsSync } from 'node:fs';

test('each road connects only consecutive challenges and stays within the map', () => {
  assert.deepEqual(STOPS[0], START);
  for (let id = 1; id <= 10; id++) {
    assert.deepEqual(ROADS[id][0], STOPS[id - 1]);
    assert.deepEqual(ROADS[id].at(-1), STOPS[id]);
    assert.ok(ROADS[id].every(point => point.every(n => n >= 0 && n <= 100)));
  }
});
test('advance requires contiguous completion; bonus and recovery cannot skip a challenge', () => {
  assert.equal(canAdvance(0, []), true);
  assert.equal(canAdvance(1, []), false);
  assert.equal(canAdvance(1, [11, 12]), false);
  assert.equal(canAdvance(1, [1]), true);
  assert.equal(canAdvance(3, [1, 3]), false);
  assert.equal(canAdvance(10, [1,2,3,4,5,6,7,8,9,10]), false);
  assert.equal(nextChallenge([1, 2, 11, 12]), 3);
});
test('distance interpolation follows bends instead of cutting across the landscape', () => {
  const route = measureRoute([[0, 0], [10, 0], [10, 10]]);
  const corner = route.lengths[0] / route.distance;
  assert.deepEqual(pointOnRoute(route, corner), [10, 0]);
  assert.deepEqual(pointOnRoute(route, 0), [0, 0]);
  assert.deepEqual(pointOnRoute(route, 1), [10, 10]);
  assert.equal(pointOnRoute(route, .3)[1], 0);
  assert.equal(pointOnRoute(route, .8)[0], 10);
});

test('all three worlds have complete, consecutive routes and local map assets', () => {
  for (const world of Object.values(UNITS)) {
    assert.ok(existsSync(new URL(world.image, import.meta.url)));
    assert.equal(world.stops.length, world.mainCount + 1);
    assert.equal(world.roads.length, world.mainCount + 1);
    for (let id = 1; id <= world.mainCount; id++) {
      assert.deepEqual(world.roads[id][0], world.stops[id - 1]);
      assert.deepEqual(world.roads[id].at(-1), world.stops[id]);
      const route = measureRoute(world.roads[id]);
      assert.ok(route.distance > 0);
      assert.ok(world.roads[id].every(point => point.every(n => n >= 0 && n <= 100)));
    }
    const complete = Array.from({length:world.mainCount}, (_, i) => i + 1);
    assert.equal(canAdvance(world.mainCount, complete, world.mainCount), false);
    assert.equal(canAdvance(world.mainCount - 1, complete.slice(0,-1), world.mainCount), true);
    assert.equal(nextChallenge(complete.slice(0,-1), world.mainCount), world.mainCount);
  }
  assert.equal(new Set(Object.values(UNITS).map(w => w.storageKey)).size, 3);
});

test('new units provide unique activities and valid answers for every node', () => {
  for (const world of [UNITS[2], UNITS[3]]) {
    assert.equal(world.challenges.length, world.mainCount + 2);
    assert.equal(new Set(world.challenges.map(c => c.id)).size, world.challenges.length);
    assert.equal(world.challenges.filter(c => c.recovery).length, 1);
    for (const c of world.challenges) {
      const [question, answers, correct, explanation] = world.questions[c.id];
      assert.ok(question.length > 10 && explanation.length > 10);
      assert.ok(correct >= 0 && correct < answers.length);
      assert.ok(Number.isFinite(c.xp) && c.xp > 0);
    }
  }
});
