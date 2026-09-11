import test from 'node:test';
import assert from 'node:assert/strict';
import { makeLongUnit, divideRoad } from './long-unit.js';
import { UNITS } from './worlds.js';
import { canAdvance, measureRoute } from './journey.js';
import { existsSync } from 'node:fs';

test('all supported quantities retain one general map and the same three zones',()=>{
  const expected=makeLongUnit(UNITS[1],36);
  for(let count=1;count<=120;count++) {
    const unit=makeLongUnit(UNITS[1],count);
    assert.equal(unit.generalImage,UNITS[1].image);
    assert.deepEqual(unit.zones.map(z=>z.image),expected.zones.map(z=>z.image));
    assert.equal(unit.zones.reduce((n,z)=>n+z.count,0),count);
    assert.ok(Math.max(...unit.zones.map(z=>z.count))-Math.min(...unit.zones.map(z=>z.count))<=1);
    assert.equal(unit.challenges.length,count+2);
    assert.equal(unit.challenges[count+1].recovery,true);
    assert.equal(unit.challenges[count-1].zone,2);
    const ids=unit.pages.flatMap(p=>Array.from({length:p.end-p.start+1},(_,i)=>p.start+i));
    assert.deepEqual(ids,Array.from({length:count},(_,i)=>i+1));
    unit.pages.forEach(p=>assert.ok(p.end-p.start+1<=12));
    unit.zones.forEach(z=>assert.ok(existsSync(z.image)));
  }
});
test('pagination preserves walking continuity and cannot bypass unfinished challenges',()=>{
  const unit=makeLongUnit(UNITS[1],60);
  assert.deepEqual(unit.zones.map(z=>z.count),[20,20,20]);
  assert.equal(unit.pages.length,6);
  for(let id=1;id<=60;id++) {
    const c=unit.challenges[id-1],p=unit.pages[c.chapter];
    assert.deepEqual(unit.roads[id].at(-1),unit.stops[id]);
    if(id===p.start) assert.deepEqual(unit.roads[id][0],p.entry);
    if(id>1 && c.zone===unit.challenges[id-2].zone) assert.deepEqual(unit.roads[id][0],unit.stops[id-1]);
    if(id<60) {
      assert.equal(canAdvance(id,Array.from({length:id-1},(_,i)=>i+1),60),false);
      assert.equal(canAdvance(id,Array.from({length:id},(_,i)=>i+1),60),true);
    }
  }
  assert.notEqual(unit.storageKey,makeLongUnit(UNITS[1],12).storageKey);
  assert.notEqual(unit.storageKey,UNITS[1].storageKey);
});
test('invalid quantities are rejected and resampling preserves every road bend',()=>{
  [0,-1,121,3.5,NaN,Infinity].forEach(n=>assert.throws(()=>makeLongUnit(UNITS[1],n),RangeError));
  const divided=divideRoad(UNITS[1].roads,12);
  const length=roads=>roads.slice(1).reduce((n,r)=>n+measureRoute(r).distance,0);
  assert.ok(Math.abs(length(divided.roads)-length(UNITS[1].roads))<1e-6);
});
