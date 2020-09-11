/// <reference types="node" />
import { Component, IComponent } from './component';
import { EventEmitter } from 'events';
export declare function component(name: string): Component;
export declare function build(name: string, data?: IComponent): Component;
/**
 * Manager that holds all runtime components
 * It creates and destroy the components
 * Emit events in function of:
 *  - component creation
 *  - component deletion
 *
 * @class ComponentManager
 */
export declare class ComponentManager extends EventEmitter {
    static EV_COMPONENT_CREATED: string;
    static EV_COMPONENT_DELETED: string;
    protected components: {
        [name: string]: Component;
    };
    private static instance;
    private constructor();
    static getInstance(): ComponentManager;
    /**
     * Given a component name, check if that component exists
     * @param name
     */
    exists(name: string): boolean;
    /**
     * Returns an array of all components this manager has
     */
    all(): Array<Component>;
    /**
     * Find and return a copy of component by its name.
     * If does not exists then just returns null
     * @param name
     */
    find(name: string): Component;
    /**
     * A factory method for build existing components with given data instead of default data
     * @param name
     * @param data
     */
    build(name: string, data?: IComponent): Component;
    /**
     * Create a new Component. If component already exists, just return the existing component
     * Emits a [component.created] event on create
     * @param name
     * @param data
     */
    component(name: string, data: IComponent): Component;
    /**
     * Removes a component from this manager
     * Returns true if the component trying to remove exists, else false
     * Emits a [component.deleted] event on delete
     * @param name
     */
    deleteComponent(name: string): boolean;
}
