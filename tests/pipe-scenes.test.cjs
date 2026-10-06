const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function game() {
  const element = { getContext: () => ({}), addEventListener() {}, focus() {} };
  const context = vm.createContext({
    document: { querySelector: () => element, querySelectorAll: () => [], addEventListener() {} },
    window: { addEventListener() {} }, requestAnimationFrame() {}
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8'), context);
  return code => vm.runInContext(code, context);
}

const entrance = `const entrance=blocks.filter(b=>b.pipe)[2];
 p.x=entrance.x+19;p.y=entrance.y-p.h;p.on=true;`;

test('only the third pipe accepts a grounded player on its opening', () => {
  const run = game();
  assert.equal(run(`start();p.x=679;p.y=300;p.on=true;usePipe()`), false);
  assert.equal(run(`${entrance}p.on=false;usePipe()`), false);
  assert.equal(run(`p.on=true;usePipe()`), true);
  assert.equal(run('scene'), 'underground');
});

test('underground coins and surface state survive a round trip', () => {
  const run = game();
  run(`start();score=500;time=240;coins[0].taken=true;blocks[0].used=true;
       enemies[0].alive=false;${entrance}usePipe();
       p.x=220;p.y=364;step(1/120);`);
  assert.equal(run('score'), 600);
  run(`const exit=blocks.find(b=>b.portal);p.x=exit.x+19;p.y=exit.y-p.h;p.on=true;usePipe();`);
  assert.equal(run('scene'), 'surface');
  assert.equal(run('p.x'), 4769);
  assert.equal(run('p.y'), 300);
  assert.equal(run('score'), 600);
  assert.ok(run('time>239&&time<=240'));
  assert.ok(run('coins[0].taken&&blocks[0].used&&!enemies[0].alive'));
  run('p.x=entrance.x+19;p.y=entrance.y-p.h;p.on=true;usePipe();');
  assert.ok(run('coins.find(c=>c.x===220&&c.y===370).taken'));
  run('reset();');
  assert.equal(run('scene'), 'surface');
  assert.equal(run('score'), 0);
  assert.ok(run('underground.coins.every(c=>!c.taken)&&surface.coins.every(c=>!c.taken)'));
});

test('the underground exit is reachable by a normal jump', () => {
  const run = game();
  run(`start();${entrance}usePipe();p.x=1340;p.y=364;p.on=true;
       keys.add('ArrowRight');jump();`);
  assert.ok(run(`let landed=false;
    for(let i=0;i<180;i++){
      if(p.x>=1419)keys.delete('ArrowRight');step(1/120);
      if(p.on&&p.y===300){landed=true;break;}
    }
    for(let i=0;i<30&&p.x<1419;i++)step(1/120);
    keys.clear();landed&&usePipe();`));
  assert.equal(run('scene'), 'surface');
});
