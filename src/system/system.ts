import {Entity} from '../entity/entity';
import _ from 'lodash';

export class System {

    /**
     * The system unique key name
     */
    public name: string;

    /**
     * The logic executed for each entity having the required components
     */
    public handle: Function;

    /**
     * The components type name this system will iterate for.
     * 
     * This are the component names, no the components it self
     */
    public requiredComponents: Array<string>;

    public entities: {[name:string]: Entity};

    constructor(name:string, requiredComponents: Array<string>, handle:Function){

        this.name = name;
        this.requiredComponents = requiredComponents;
        this.handle = handle;
        this.entities = {};
    }

    /**
     * Logic that iterates over the entities this system has assigned and then
     * call the handle method for each entity and then pass it the entity id and
     * an object with the required components of that entity
     */
    public update(): void {

        _.each(this.entities, (entity: Entity) => {

            this.handle(entity.id, _.pick(entity.components, this.requiredComponents));

        });
    }
}