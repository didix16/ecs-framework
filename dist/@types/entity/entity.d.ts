import { Component } from '../component/component';
export declare function getEntityId(id: string | Entity): string;
export declare class Entity {
    id: string;
    components: {
        [name: string]: Component;
    };
    constructor(id: string);
    toString(): string;
}
