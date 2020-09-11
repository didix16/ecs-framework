import { Component } from '../component/component';

export function getEntityId(id: string|Entity): string {

    return id+'';
}

export class Entity {

    public id: string;
    public components: {[name:string]: Component};
    constructor(id: string){

        this.id = id;
        this.components = {};
    }

    public toString(): string {

        return this.id;
    }

}