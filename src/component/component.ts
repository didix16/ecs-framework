export interface IComponent { [key: string]: any}

export class Component implements IComponent {

    constructor(data: IComponent){

        Object.assign(this, data);
    }

    public toString() {

        return JSON.stringify(this);
    }
}