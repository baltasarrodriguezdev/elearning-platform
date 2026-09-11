import test from 'node:test';
import assert from 'node:assert/strict';
import {parseUnitEntry,unitUrl} from './unit-routing.js';
import {makeVerticalUnit,renderVerticalTerrain} from './vertical-world.js';
import {UNITS} from './worlds.js';
import {existsSync} from 'node:fs';

test('the default entry requires a count in every world and normalizes legacy URLs',()=>{
  for(const id of [1,2,3]){
    assert.deepEqual(parseUnitEntry(`?unit=${id}`),{id,count:null,invalid:false});
    for(const raw of ['',0,-1,'1.5','abc',121])assert.deepEqual(parseUnitEntry(`?unit=${id}&count=${raw}`),{id,count:null,invalid:true});
    for(const count of [1,12,36,120]){
      const entry=parseUnitEntry(`?unit=${id}&demo=template&layout=single&count=${count}`);
      assert.equal(entry.count,count);assert.equal(unitUrl(entry.id,entry.count),`?unit=${id}&count=${count}`);
    }
  }
  assert.equal(parseUnitEntry('').count,null);
});
test('all three primary worlds have their own terrain, activities, rewards and isolated progress',()=>{
  const keys=new Set(),tiles=new Set();
  for(const base of Object.values(UNITS)){
    for(const count of [1,2,12,36,120]){
      const unit=makeVerticalUnit(base,count);
      assert.equal(unit.title,base.title);assert.equal(unit.theme,base.theme);
      assert.equal(unit.longDemo,false);assert.equal(unit.challenges.length,count+2);
      assert.ok(existsSync(unit.tile));tiles.add(unit.tile);
      assert.ok(!keys.has(unit.storageKey));keys.add(unit.storageKey);
      for(const c of unit.challenges){const q=unit.questions[c.id];assert.ok(q[0]);assert.ok(q[2]>=0&&q[2]<q[1].length);}
      const recovery=unit.challenges.find(c=>c.recovery);
      assert.equal(recovery.title,base.challenges.find(c=>c.recovery).title);
      assert.deepEqual(unit.questions[recovery.id],base.questions[base.challenges.find(c=>c.recovery).id]);
      unit.roads.flat().forEach(([x,y])=>assert.ok(x>=12&&x<=88&&y>0&&y<100));
      const art=renderVerticalTerrain(unit);
      assert.equal((art.match(/class="vertical-castle"/g)||[]).length,1);
      if(base.theme!=='desert')assert.ok(!art.includes('mushroom-house'));
    }
  }
  assert.equal(tiles.size,3);
});
