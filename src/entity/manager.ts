import {Entity, getEntityId} from './entity';
import {IComponent, Component} from '../component/component';
import {component as getComponent, build as buildComponent} from '../component/manager';
import {v4 as uuidv4 } from 'uuid';
import {EventEmitter} from 'events';
import _ from 'lodash';

/**
 * Helper function that gets an entity instance by its uuid
 * If entity is just an instance, then return the instance
 * If entity does not exists, just returns null
 * @param id 
 */
export function entity(id:string|Entity): Entity{

    if (id instanceof Entity) return id;
    return EntityManager.getInstance().find(id);
}

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
export class EntityManager extends EventEmitter {
    
    /* Events */
    public static EV_ENTITY_CREATED     = 'entity.created';
    public static EV_ENTITY_DELETED     = 'entity.deleted';
    public static EV_COMPONENT_ADDED    = 'component.added';
    public static EV_COMPONENT_REMOVED  = 'component.removed';
    
    protected entities: { [name:string]: Entity}
    
    private static instance: EntityManager;
    
    private constructor(){

        super();
        this.entities = {};
    }

    public static getInstance() : EntityManager {

        if (!EntityManager.instance){

            EntityManager.instance = new EntityManager();
        }

        return EntityManager.instance;
    }

    /**
     * Given a entity id string or Entity instance, return the entity id
     * @param id 
     */
    protected getEntityId(id: string|Entity): string {

        return getEntityId(id);
    }

    /**
     * Given an entity id, checks if that entity exists
     * @param id 
     */
    public exists(id: string): boolean {

        return this.entities[id] instanceof Entity;
    }

    /**
     * Create a new Entity. If entity already exists, just return the existing entity
     * Emits a [entity.created] event on create
     * @param id 
     */
    public entity(id?:string): Entity {

        if(!id){
            id = uuidv4();
        }
        
        if(!this.exists(id)){
            this.entities[id] = new Entity(id);
            this.emit(EntityManager.EV_ENTITY_CREATED, id);
        }

        return this.entities[id];
    }

    /**
     * Given an entity id, return the instance of the entity.
     * If doest not exists, then null is returned
     * @param id 
     */
    public find(id:string): Entity {

        return this.entities[id] ?? null;
    }
    
    /**
     * Removes an entity from this manager
     * Returns true if the entity trying to remove exists, else false
     * Emits a [entity.deleted] event on delete
     * @param id
     */
    public deleteEntity(id: string|Entity): boolean {

        id = this.getEntityId(id);

        if(this.exists(id)){
            
            this.emit(EntityManager.EV_ENTITY_DELETED, this.entities[id]);
            delete this.entities[id];
            return true;
        }

        return false;
    }

    /**
     * Returns an array of all entities this manager has
     */
    public all(): Array<Entity>{

        return Object.values(this.entities);
    }

    /**
     * Get those entities that has all passed components
     * @param components 
     */
    public findByComponents(components: Array<string>): Array<Entity> {

        return _.filter(this.all(), (entity:Entity) => {

            return _.size(_.pick(entity.components, components)) === components.length;
        });
    }

    /**
     * Given an entity and a component, add it to the entity.
     * If enity already has the component does nothing, else add it to the entity
     * Emits a [component.added] event on add
     * Returns self for fluent
     * @param component 
     */
    public addComponent(entity: string|Entity, component: string, data?: IComponent): this {

        entity = this.getEntityId(entity);

        if (!this.hasComponent(entity, component)) {

            this.entities[entity].components[component] = buildComponent(component, data);
            this.emit(EntityManager.EV_COMPONENT_ADDED, entity, component);
        }

        return this;

    }

    /**
     * Given an entity and a component name, check if that entity has the component
     * Return true if has, false in any other case ( includes errors like non existance )
     * @param entity 
     * @param component 
     */
    public hasComponent(entity: string|Entity, component: string): boolean {

        entity = this.getEntityId(entity);
        
        return this.entities[entity].components[component] instanceof Component
    }

    /**
     * Given an entity and a component name, removes that component from the entity
     * If entity does not have the component, does nothing, else removes
     * Emits a [component.removed] event on remove
     * Return self for fluent
     * @param entity 
     * @param component 
     */
    public removeComponent(entity: string|Entity, component: string): this {

        entity = this.getEntityId(entity);

        if (this.hasComponent(entity, component)) {
            delete this.entities[entity].components[component];
            this.emit(EntityManager.EV_COMPONENT_REMOVED, entity, component);
        }

        return this;

        
    }
}