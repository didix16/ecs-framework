/// <reference types="node" />
import { System } from './system';
import { EventEmitter } from 'events';
import { Entity } from '../entity/entity';
export declare function system(name: string): System;
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
export declare class SystemManager extends EventEmitter {
    static EV_SYSTEM_CREATED: string;
    static EV_SYSTEM_DELETED: string;
    static EV_ENTITY_ATTACHED: string;
    static EV_ENTITY_DETTACHED: string;
    protected systems: {
        [name: string]: System;
    };
    private static instance;
    private constructor();
    static getInstance(): SystemManager;
    /**
     * Given a system name, check if that system exists
     * @param name
     */
    exists(name: string): boolean;
    /**
     * Returns an array of all systems this manager has
     */
    all(): Array<System>;
    /**
     * Given a system key name, return the system instance if exists
     * If not exists, null is returned
     * @param id
     */
    find(name: string): System;
    /**
     * Return those systems that has all passed components
     * @param components
     */
    findByComponents(components: Array<string>): Array<System>;
    /**
     * Create a new System. If system already exists, just return the existing system
     * Emits a [system.created] event on create
     *
     * @param name
     * @param handle
     */
    system(name: string, requiredComponents: Array<string>, handle: Function): System;
    /**
     * Given a system key name and an entity instance, try to attach entity to system
     * If could be attach, returns true, else false
     * Emits a [entity.attached] event on attach
     *
     * @pre System and Entity exists
     * @param system
     * @param entity
     */
    attachEntity(system: string, entity: Entity): boolean;
    /**
     * Given a system key name and an entity instance, try to dettach entity from system
     * If entity is dettached, returns true, else false
     * Emits a [entity.dettached] event on dettach
     *
     * @param system
     * @param entity
     */
    dettachEntity(system: string, entity: Entity): boolean;
    /**
     * Given a system key name and an entity, check if that entity is already in the system
     *
     * @pre System exists
     * @param system
     * @param entity
     */
    protected hasEntity(system: string, entity: Entity): boolean;
    /**
     * Check if the entity has all requirements to be added to system
     *
     * @pre System exists
     * @param entity
     */
    protected validEntity(system: string, entity: Entity): boolean;
    /**
     * Removes a system from this manager
     * Returns true if the system trying to remove exists, else false
     * Emits a [system.deleted] event on delete
     * @param name
     */
    deleteSystem(name: string): boolean;
}
