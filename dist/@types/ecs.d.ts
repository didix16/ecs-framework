/// <reference types="node" />
import { EntityManager } from './entity/manager';
import { ComponentManager } from './component/manager';
import { SystemManager } from './system/manager';
import { IComponent } from './component/component';
import { EventEmitter } from 'events';
import { System } from './system/system';
import { Entity } from './entity/entity';
declare enum RUN_STATUS {
    Stopped = 0,
    Running = 1,
    Paused = 2
}
export declare class ECS extends EventEmitter {
    private static DEBUG;
    static EV_BEFORE_TICK: string;
    static EV_AFTER_TICK: string;
    static EV_RUN: string;
    static EV_PAUSE: string;
    static EV_STOP: string;
    protected em: EntityManager;
    protected cm: ComponentManager;
    protected sm: SystemManager;
    protected FPS: number;
    protected MS_PER_UPDATE: number;
    protected useFps: boolean;
    protected status: RUN_STATUS;
    constructor();
    /**
     * If ECS.DEBUG is set to true, then prints the msg into console
     * @param msg
     */
    private debug;
    /**
     * Register events listeners for all managers
     */
    protected registerEvents(): void;
    /**
     * Generates a new entity and returns it
     * If entity already exists, just returns it
     * @param id
     */
    entity(id?: string): Entity;
    /**
     * Deletes an existing entity
     * @param id
     */
    deleteEntity(id: string | Entity): this;
    /**
     * Add existing components to the specified entity
     * @param entity
     * @param components
     */
    addComponents(entity: string | Entity, components: Array<string>, data?: Array<IComponent>): this;
    /**
     * Remove components from the specified entity
     * @param entity
     * @param components
     */
    removeComponents(entity: string | Entity, components: Array<string>): this;
    /**
     * Generates a new component and returns it.
     * If component already exists, just returns it
     * @param name
     * @param data
     */
    component(name: string, data: {
        [name: string]: any;
    }): import("./component/component").Component;
    /**
     * Removes an existing component from in-memory
     * NOTE: Assigned components to entities will not be removed!
     * @param name
     */
    deleteComponent(name: string): this;
    /**
     * Generates a new system and returns it.
     * If system already exists, just returns it
     * @param name
     * @param components
     * @param handle
     */
    system(name: string, components: Array<string>, handle: Function): System;
    /**
     * Deletes an existing system
     * @param name
     */
    deleteSystem(name: string): this;
    /**
     * Adds an entity to a system.
     * The entity will be attached only if has required components for that system
     * @param system
     * @param entity
     * @throws if already attached or system incompatible
     */
    attachEntity(system: string, entity: string | Entity): this;
    dettachEntity(system: string, entity: string | Entity): this;
    /**
     * Runs one loop for all existings systems calling its update method
     * Emits [EV_BEFORE_TICK, EV_AFTER_TICK] events wich payload are the systems
     */
    tick(): void;
    /**
     * Run loop with fps
     */
    protected runWithFPS(): void;
    /**
     * Run loop without FPS. Runs at machine speed
     */
    protected runWithoutFPS(): void;
    /**
     * Runs ECS loop
     * Emits [ecs:run] event
     */
    run(): void;
    /**
     * Pauses the ECS loop
     * Emits [ecs:pause] event
     */
    pause(): this;
    /**
     * Stops the ECS loop
     * Emits [ecs:stop] event
     */
    stop(): this;
}
export {};
