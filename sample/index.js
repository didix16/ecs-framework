let engine = require( '../dist/ecs.umd')

let ECS = new engine.ECS();
let e = ECS.entity();

ECS.component('position', {x:0, y:0});
ECS.component('nameable', {name: ''});

ECS.addComponents(e, ['position', 'nameable'], [{x: 1, y: 2}, {name: 'test'}]);
ECS.addComponents(ECS.entity('me'), ['position']);

ECS.system('position-updater', ['position'], (entity, {position}) =>{

    console.log(`Updating position ${position} of entity ${entity}`);
});

ECS.tick();

ECS.removeComponents(e, ['position']);

ECS.tick();

ECS.run();