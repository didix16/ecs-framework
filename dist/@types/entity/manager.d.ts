/// <reference types="node" />
import { Entity } from './entity';
import { IComponent } from '../component/component';
import { EventEmitter } from 'events';
/**
 * Helper function that gets an entity instance by its uuid
 * If entity is just an instance, then return the instance
 * If entity does not exists, just returns null
 * @param id
 */
export declare function entity(id: string | Entity): Entity;
/**
 * Manager that holds entities in runtime. Ensures each entity is unique
 * and does not have duplicated components
 * Emits event in function of:
 *  - entity creation
 *  - entity deletion
 *  - component addition into an entity
 *  - component removal from an entity
 *
 * @class EntityManager
 */
export declare class EntityManager extends EventEmitter {
    static EV_ENTITY_CREATED: string;
    static EV_ENTITY_DELETED: string;
    static EV_COMPONENT_ADDED: string;
    static EV_COMPONENT_REMOVED: string;
    protected entities: {
        [name: string]: Entity;
    };
    private static instance;
    private constructor();
    static getInstance(): EntityManager;
    /**
     * Given a entity id string or Entity instance, return the entity id
     * @param id
     */
    protected getEntityId(id: string | Entity): string;
    /**
     * Given an entity id, checks if that entity exists
     * @param id
     */
    exists(id: string): boolean;
    /**
     * Create a new Entity. If entity already exists, just return the existing entity
     * Emits a [entity.created] event on create
     * @param id
     */
    entity(id?: string): Entity;
    /**
     * Given an entity id, return the instance of the entity.
     * If doest not exists, then null is returned
     * @param id
     */
    find(id: string): Entity;
    /**
     * Removes an entity from this manager
     * Returns true if the entity trying to remove exists, else false
     * Emits a [entity.deleted] event on delete
     * @param id
     */
    deleteEntity(id: string | Entity): boolean;
    /**
     * Returns an array of all entities this manager has
     */
    all(): Array<Entity>;
    /**
     * Get those entities that has all passed components
     * @param components
     */
    findByComponents(components: Array<string>): Array<Entity>;
    /**
     * Given an entity and a component, add it to the entity.
     * If enity already has the component does nothing, else add it to the entity
     * Emits a [component.added] event on add
     * Returns self for fluent
     * @param component
     */
    addComponent(entity: string | Entity, component: string, data?: IComponent): this;
    /**
     * Given an entity and a component name, check if that entity has the component
     * Return true if has, false in any other case ( includes errors like non existance )
     * @param entity
     * @param component
     */
    hasComponent(entity: string | Entity, component: string): boolean;
    /**
     * Given an entity and a component name, removes that component from the entity
     * If entity does not have the component, does nothing, else removes
     * Emits a [component.removed] event on remove
     * Return self for fluent
     * @param entity
     * @param component
     */
    removeComponent(entity: string | Entity, component: string): this;
}
