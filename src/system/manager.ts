import {System} from './system';
import {EventEmitter} from 'events';
import {Entity} from '../entity/entity';
import _ from 'lodash';

/**
 * Helper function that gets a system instance by its name
 * If system does not exists, just returns null
 * @param id 
 */
export function system(name:string): System {

    return SystemManager.getInstance().find(name);
}
/**
 * Manager that holds all systems. Ensures that a system only iterates over
 * the entities that has the required components.
 * Emits events in function of:
 *  - system creation
 *  - system deletion
 *  - entity attachment to a system
 *  - entity dettachment from a system
 * 
 * @class SystemManager
 */
export class SystemManager extends EventEmitter{

    /* Events */
    public static EV_SYSTEM_CREATED     = 'system.created';
    public static EV_SYSTEM_DELETED     = 'system.deleted';
    public static EV_ENTITY_ATTACHED    = 'entity.attached';
    public static EV_ENTITY_DETTACHED   = 'entity.dettached';

    protected systems: {[name:string]: System};

    private static instance: SystemManager;

    private constructor(){
        
        super();
        this.systems = {};
    }

    public static getInstance() : SystemManager {

        if (!SystemManager.instance){

            SystemManager.instance = new SystemManager();
        }

        return SystemManager.instance;
    }

    /**
     * Given a system name, check if that system exists
     * @param name 
     */
    public exists(name:string): boolean{

        return this.systems[name] instanceof System;
    }

    /**
     * Returns an array of all systems this manager has
     */
    public all(): Array<System>{

        return Object.values(this.systems);
    }

    /**
     * Given a system key name, return the system instance if exists
     * If not exists, null is returned
     * @param id 
     */
    public find(name:string): System {

        return this.systems[name] ?? null;
    }

    /**
     * Return those systems that has all passed components
     * @param components 
     */
    public findByComponents(components: Array<string>): Array<System> {

        return _.filter(this.all(), (system:System) => {

            return _.intersection(system.requiredComponents, components).length === components.length;
        });
    }

    /**
     * Create a new System. If system already exists, just return the existing system
     * Emits a [system.created] event on create
     * 
     * @param name 
     * @param handle 
     */
    public system(name:string, requiredComponents: Array<string>, handle: Function): System {

        if ( ! this.exists(name)) {
            
            this.systems[name] = new System(name, requiredComponents, handle);
            this.emit(SystemManager.EV_SYSTEM_CREATED, name);
        }

        return this.systems[name];
    }

    /**
     * Given a system key name and an entity instance, try to attach entity to system
     * If could be attach, returns true, else false
     * Emits a [entity.attached] event on attach
     * 
     * @pre System and Entity exists
     * @param system 
     * @param entity 
     */
    public attachEntity(system:string, entity: Entity): boolean {

        if (!this.hasEntity(system, entity) && this.validEntity(system, entity)){
            
            this.systems[system].entities[entity.id] = entity;
            this.emit(SystemManager.EV_ENTITY_ATTACHED, entity.id, system);
            return true;
        }

        return false;
        
        
    }

    /**
     * Given a system key name and an entity instance, try to dettach entity from system
     * If entity is dettached, returns true, else false
     * Emits a [entity.dettached] event on dettach
     * 
     * @param system 
     * @param entity 
     */
    public dettachEntity(system:string, entity: Entity): boolean {

        if (this.hasEntity(system, entity)) {

            delete this.systems[system].entities[entity.id];
            this.emit(SystemManager.EV_ENTITY_DETTACHED, entity.id, system);
            return true;
        }

        return false;
    }

    /**
     * Given a system key name and an entity, check if that entity is already in the system
     * 
     * @pre System exists
     * @param system 
     * @param entity 
     */
    protected hasEntity(system:string, entity: Entity): boolean {

        return this.systems[system].entities[entity.id] instanceof Entity;
    }
    
    /**
     * Check if the entity has all requirements to be added to system
     * 
     * @pre System exists
     * @param entity 
     */
    protected validEntity(system:string, entity: Entity): boolean{

        let requiredComps = this.systems[system].requiredComponents;
        let reqCompsLen = requiredComps.length;

        return _.size(_.pick(entity.components, requiredComps)) === reqCompsLen;
    }

    /**
     * Removes a system from this manager
     * Returns true if the system trying to remove exists, else false
     * Emits a [system.deleted] event on delete
     * @param name 
     */
    public deleteSystem(name:string): boolean {

        if (this.exists(name)){

            delete this.systems[name];
            this.emit(SystemManager.EV_SYSTEM_DELETED, name);
            return true;
        }

        return false;
    }
}