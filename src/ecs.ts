import {EntityManager, entity as getEntity} from './entity/manager';
import {ComponentManager} from './component/manager';
import {SystemManager, system as getSystem} from './system/manager';
import { IComponent } from './component/component';
import {EventEmitter} from 'events';
import { System } from './system/system';
import { Entity } from './entity/entity';
import _ from 'lodash';

enum RUN_STATUS {

    Stopped,
    Running,
    Paused,
    
}

export class ECS extends EventEmitter {

    private static DEBUG: boolean = true;

    public static EV_BEFORE_TICK = 'ecs:before.tick';
    public static EV_AFTER_TICK = 'ecs:after.tick';
    public static EV_RUN = 'ecs:run';
    public static EV_PAUSE = 'ecs:pause';
    public static EV_STOP = 'ecs:stop';


    protected em: EntityManager;
    protected cm: ComponentManager;
    protected sm: SystemManager;

    protected FPS: number = 60.0;
    protected MS_PER_UPDATE = 0;
    protected useFps: boolean = false;

    protected status: RUN_STATUS = RUN_STATUS.Stopped;

    constructor(){

        super();
        this.em = EntityManager.getInstance();
        this.cm = ComponentManager.getInstance();
        this.sm = SystemManager.getInstance();

        this.MS_PER_UPDATE = 1000.0/ this.FPS;

        this.registerEvents();
    }

    /**
     * If ECS.DEBUG is set to true, then prints the msg into console
     * @param msg 
     */
    private debug(msg: string): void {

        if(ECS.DEBUG) console.log(`[DEBUG]:: ${msg}`);
    }

    /**
     * Register events listeners for all managers
     */
    protected registerEvents(): void {

        this.em.on(EntityManager.EV_ENTITY_CREATED, (entityId:string) => {

            this.debug(`entity created: ${entityId}`);
        });

        this.em.on(EntityManager.EV_ENTITY_DELETED, (entity:Entity) => {

            // remove entity from all posible systems
            this.sm.all().forEach((system: System) => {

                this.sm.dettachEntity(system.name, entity);
            })
        });

        this.em.on(EntityManager.EV_COMPONENT_ADDED, (entityId:string, componentName: string) => {
            
            // find systems by component and attach entity to them
            this.sm.findByComponents([componentName]).forEach((system:System) => {

                this.sm.attachEntity(system.name, this.em.find(entityId));
            });

        });

        this.em.on(EntityManager.EV_COMPONENT_REMOVED, (entityId:string, componentName: string) => {


            // remove the entity from all systems that use that component
            this.sm.findByComponents([componentName]).forEach((system:System) => {

                this.sm.dettachEntity(system.name, this.em.find(entityId));
            });

        });

        this.cm.on(ComponentManager.EV_COMPONENT_CREATED, (componentName:string) => {

            this.debug(`component created: ${componentName}`)
        });

        this.cm.on(ComponentManager.EV_COMPONENT_DELETED, (componentName:string) => {

            // no longer exists in memory, so it cannot be founded and assing to any entity
            // however, components added previously still exists till its dettachment

            this.debug(`component deleted: ${componentName}`);
        });
        
        this.sm.on(SystemManager.EV_SYSTEM_CREATED, (systemName:string) => {

            this.debug(`system created: ${systemName}`);

            // attach those entitites that are compatible with the new system
            this.em.findByComponents(getSystem(systemName).requiredComponents).forEach((entity:Entity) => {

                this.sm.attachEntity(systemName, entity);
            });
        });

        this.sm.on(SystemManager.EV_SYSTEM_DELETED, (systemName:string) => {

            this.debug(`system deleted: ${systemName}`);
        });

        this.sm.on(SystemManager.EV_ENTITY_ATTACHED, (entityId:string, systemName:string) => {

            this.debug(`entity ${entityId} attached to ${systemName} system`);
        });

        this.sm.on(SystemManager.EV_ENTITY_DETTACHED, (entityId:string, systemName:string) => {

            this.debug(`entity ${entityId} dettached from ${systemName} system`);
        });


    }

    /**
     * Generates a new entity and returns it
     * If entity already exists, just returns it
     * @param id 
     */
    public entity(id?: string){

        return this.em.entity(id);
    }

    /**
     * Deletes an existing entity
     * @param id 
     */
    public deleteEntity(id:string|Entity): this {

        this.em.deleteEntity(id);
        return this;
    }

    /**
     * Add existing components to the specified entity
     * @param entity 
     * @param components 
     */
    public addComponents(entity: string|Entity, components: Array<string>, data?: Array<IComponent>): this {

        if (_.isUndefined(data)) data = [];

        components.forEach((component, idx) => {

            if (this.cm.exists(component)){
                
                this.em.addComponent(entity, component, data[idx] ?? {});
            }
                
            else
                throw new Error(`Component ${component} does not exists!`);
        });

        return this;
    }

    /**
     * Remove components from the specified entity
     * @param entity 
     * @param components 
     */
    public removeComponents(entity: string|Entity, components: Array<string>): this {

        components.forEach((component) => {

            this.em.removeComponent(entity, component);
        });

        return this;
    }

    /**
     * Generates a new component and returns it.
     * If component already exists, just returns it
     * @param name 
     * @param data 
     */
    public component(name: string, data: {[name:string]: any}){

        return this.cm.component(name, data);
    }

    /**
     * Removes an existing component from in-memory
     * NOTE: Assigned components to entities will not be removed!
     * @param name 
     */
    public deleteComponent(name:string): this {

        this.cm.deleteComponent(name);
        return this;
    }

    /**
     * Generates a new system and returns it.
     * If system already exists, just returns it
     * @param name 
     * @param components 
     * @param handle 
     */
    public system(name: string, components: Array<string>, handle: Function){

        return this.sm.system(name, components, handle);
    }

    /**
     * Deletes an existing system
     * @param name 
     */
    public deleteSystem(name: string): this {

        this.sm.deleteSystem(name);
        return this;
    }

    /**
     * Adds an entity to a system.
     * The entity will be attached only if has required components for that system
     * @param system 
     * @param entity
     * @throws if already attached or system incompatible
     */
    public attachEntity(system: string, entity: string | Entity): this {

        if (! this.sm.exists(system)){

            throw new Error(`System ${system} does not exists!`);
        }
        
        let e: Entity = getEntity(entity);
        if(!e)
            throw new Error(`Entity ${entity} does not exists`);

        let result: boolean = this.sm.attachEntity(system, e);

        if (! result){
            let components: string = getSystem(system).requiredComponents.join(",");
            throw new Error(`Entity could not be attached because is already attached or system incompatible. Required components are: [${components}]`);
        }
            

        return this;
    }

    /**
     * Removes an entity from a system
     * The entity will be dettached if entity and system passed exsits
     * @param system 
     * @param entity 
     */
    public dettachEntity(system: string, entity: string | Entity): this {

        if (! this.sm.exists(system)){

            throw new Error(`System ${system} does not exists!`);
        }

        let e: Entity = getEntity(entity);
        if(!e)
            throw new Error(`Entity ${entity} does not exists`);

        this.sm.dettachEntity(system, e);
        return this;
    }

    /**
     * Runs one loop for all existings systems calling its update method
     * Emits [EV_BEFORE_TICK, EV_AFTER_TICK] events wich payload are the systems
     */
    public tick(): void {

        let systems = this.sm.all();

        this.emit(ECS.EV_BEFORE_TICK, systems);
        systems.forEach((system) => system.update());
        this.emit(ECS.EV_AFTER_TICK, systems);
    }

    /**
     * Run loop with fps
     */
    protected runWithFPS(): void {


        let previous: number = Date.now();
        while (this.status === RUN_STATUS.Running || this.status === RUN_STATUS.Paused){

            let current: number = Date.now();
            let elapsed: number = current - previous;
            
            
            if (this.status === RUN_STATUS.Running && elapsed >= this.MS_PER_UPDATE){

                this.tick();
            }

            previous = current;
        }
    }

    /**
     * Run loop without FPS. Runs at machine speed
     */
    protected runWithoutFPS(): void {

        while (this.status === RUN_STATUS.Running || this.status === RUN_STATUS.Paused){

            this.tick();
        }
    }

    /**
     * Runs ECS loop
     * Emits [ecs:run] event
     */
    public run(): void {

        this.status = RUN_STATUS.Running;

        this.emit(ECS.EV_RUN, this);

        if (this.useFps) {
            this.runWithFPS();
        } else {
            this.runWithoutFPS();
        }
    }

    /**
     * Pauses the ECS loop
     * Emits [ecs:pause] event
     */
    public pause(): this {

        this.status = RUN_STATUS.Paused;
        this.emit(ECS.EV_PAUSE, this);

        return this;
    }

    /**
     * Stops the ECS loop
     * Emits [ecs:stop] event
     */
    public stop(): this {

        this.status = RUN_STATUS.Stopped;
        this.emit(ECS.EV_STOP, this);
        return this;
    }
}