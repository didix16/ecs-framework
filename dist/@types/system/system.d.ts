import { Entity } from '../entity/entity';
export declare class System {
    /**
     * The system unique key name
     */
    name: string;
    /**
     * The logic executed for each entity having the required components
     */
    handle: Function;
    /**
     * The components type name this system will iterate for.
     *
     * This are the component names, no the components it self
     */
    requiredComponents: Array<string>;
    entities: {
        [name: string]: Entity;
    };
    constructor(name: string, requiredComponents: Array<string>, handle: Function);
    /**
     * Logic that iterates over the entities this system has assigned and then
     * call the handle method for each entity and then pass it the entity id and
     * an object with the required components of that entity
     */
    update(): void;
}
