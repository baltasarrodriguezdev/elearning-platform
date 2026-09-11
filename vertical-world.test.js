import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { makeVerticalUnit,renderVerticalTerrain,challengeSpacing } from './vertical-world.js';
import { UNITS } from './worlds.js';
import { measureRoute,pointOnRoute,canAdvance } from './journey.js';

test('vertical levels grow upward, retain spacing and have one start and castle',()=>{
  for(const count of [1,2,6,12,36,60,120]) {
    const unit=makeVerticalUnit(UNITS[1],count);
    assert.ok(existsSync(unit.tile));
    assert.equal(unit.segmented,false);
    assert.equal(unit.challenges.length,count+2);
    assert.equal(unit.worldHeight,Array.from({length:count},(_,i)=>challengeSpacing(i+1)).reduce((a,b)=>a+b,600));
    for(let id=1;id<=count;id++) {
      const from=unit.stops[id-1],to=unit.stops[id];
      assert.ok(to[1]<from[1]);
      assert.ok(Math.abs((from[1]-to[1])/100*unit.worldHeight-challengeSpacing(id))<1e-8);
      assert.deepEqual(unit.roads[id][0],from);
      assert.deepEqual(unit.roads[id].at(-1),to);
      unit.roads[id].forEach((p,j)=>{if(j)assert.ok(p[1]<unit.roads[id][j-1][1]);});
    }
    const art=renderVerticalTerrain(unit);
    assert.equal((art.match(/class="vertical-castle"/g)||[]).length,1);
    assert.equal((art.match(/class="vertical-start"/g)||[]).length,1);
    assert.notEqual(unit.storageKey,UNITS[1].storageKey);
  }
});
test('curves vary, remain bounded and keep connected optional branches',()=>{
  for(let count=1;count<=120;count++) {
    const unit=makeVerticalUnit(UNITS[1],count);
    assert.deepEqual(makeVerticalUnit(UNITS[1],count).roads,unit.roads);
    const supports=unit.challenges.filter(c=>c.optional);
    assert.equal(supports.length,2);
    assert.notDeepEqual([supports[0].x,supports[0].y],[supports[1].x,supports[1].y]);
    supports.forEach(c=>assert.ok(unit.roads.some(road=>road.some(p=>p[0]===c.branchFrom[0]&&p[1]===c.branchFrom[1]))));
    unit.roads.flat().forEach(([x,y])=>assert.ok(x>=12&&x<=88&&y>0&&y<100));
    if(count>=12){
      assert.ok(new Set(unit.stops.slice(1,-1).map(p=>p[0])).size>=6);
      assert.ok(new Set(Array.from({length:count},(_,i)=>challengeSpacing(i+1))).size>=4);
      assert.ok(Math.min(...unit.stops.map(p=>p[0]))<25);
      assert.ok(Math.max(...unit.stops.map(p=>p[0]))>75);
      assert.ok(unit.stops[2][0]>55&&unit.stops[3][0]>70&&unit.stops[4][0]>65,'the route stays on the right before crossing back');
    }
  }
});
test('walk speed is independent of map length and no challenge can be skipped',()=>{
  const short=makeVerticalUnit(UNITS[1],12),long=makeVerticalUnit(UNITS[1],120);
  const a=measureRoute(short.roads[2],short.worldWidth,short.worldHeight);
  const b=measureRoute(long.roads[2],long.worldWidth,long.worldHeight);
  assert.ok(Math.abs(a.distance-b.distance)<1e-8);
  const p=pointOnRoute(b,.5);
  assert.ok(p[1]<long.stops[1][1]&&p[1]>long.stops[2][1]);
  assert.equal(canAdvance(2,[1,121,122],120),false);
  assert.equal(canAdvance(2,[1,2],120),true);
});
