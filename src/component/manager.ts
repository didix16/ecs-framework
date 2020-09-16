import {Component, IComponent} from './component';
import {EventEmitter} from 'events';
import _ from 'lodash';

/**
 * Helper function that gets a component instance by its name
 * If component does not exists, just returns null
 * @param name 
 */
export function component(name:string): Component {

    return ComponentManager.getInstance().find(name);
}

/**
 * Helper function that builds an exisiting component by its name and initial data
 * @param id 
 */
export function build(name:string, data?: IComponent): Component {

    return ComponentManager.getInstance().build(name, data);
}

/**
 * Manager that holds all runtime components
 * It creates and destroy the components
 * Emit events in function of:
 *  - component creation
 *  - component deletion
 * 
 * @class ComponentManager
 */
export class ComponentManager extends EventEmitter {
    
    /* Events */
    public static EV_COMPONENT_CREATED     = 'component.created';
    public static EV_COMPONENT_DELETED     = 'component.deleted';

    protected components: {[name:string]: Component}

    private static instance: ComponentManager;

    private constructor(){

        super();
        this.components = {}
    }

    public static getInstance() : ComponentManager {

        if (!ComponentManager.instance){

            ComponentManager.instance = new ComponentManager();
        }

        return ComponentManager.instance;
    }

    /**
     * Given a component name, check if that component exists
     * @param name 
     */
    public exists(name:string): boolean {

        return typeof this.components[name] !== "undefined";
    }

    /**
     * Returns an array of all components this manager has
     */
    public all(): Array<Component>{

        return Object.values(this.components);
    }

    /**
     * Find and return a copy of component by its name.
     * If does not exists then just returns null
     * @param name 
     */
    public find(name:string): Component {

        return this.components[name] ? _.clone(this.components[name]) : null;
    }

    /**
     * A factory method for build existing components with given data instead of default data
     * If component does not exists then an error is thrown
     * @param name 
     * @param data 
     */
    public build(name:string, data?: IComponent): Component {

        let comp: Component = this.find(name);

        if (!comp) throw new Error(`The component ${name} doest not exists!`);

        if (_.isUndefined(data) || _.isEmpty(data)) return comp;

        return _.assign(comp, _.pick(data,_.keys(comp)));
    }

    /**
     * Create a new Component. If component already exists, just return the existing component
     * Emits a [component.created] event on create
     * @param name 
     * @param data 
     */
    public component(name:string, data: IComponent): Component {

        if (! this.exists(name) ){

            this.components[name] = new Component(data);
            this.emit(ComponentManager.EV_COMPONENT_CREATED, name);
        }

        return _.clone(this.components[name]);
    }

    /**
     * Removes a component from this manager
     * Returns true if the component trying to remove exists, else false
     * Emits a [component.deleted] event on delete
     * @param name 
     */
    public deleteComponent(name:string): boolean {

        if (this.exists(name)){

            delete this.components[name];
            this.emit(ComponentManager.EV_COMPONENT_DELETED, name);
            return true;
        }

        return false;
    }

    /**
     * @since 1.1.0
     * 
     * Load in-memory a component from file or DDBB
     * 
     * - "file:path/to/component.js" -> Loads component from file
     * - "db:databaseName.componentName" -> connects to a MongoDB and load component from components table
     */
    public load(from:string): Component {

        throw new Error("not implemented yet");
        
        if ( from.startsWith("file:")){

            return this.loadFromFile(from.substr(5));
        } else if (from.startsWith("db:")) {

            return this.loadFromDDBB(from.substr(3));
        } else {

            throw new Error(`Undefined load protocol`);
        }
    }

    /**
     * @since 1.1.0
     * @param path 
     */
    protected loadFromFile(path: string) : Component {

        return new Component({});
    }

    /**
     * @since 1.1.0
     * @param urlConnection 
     */
    protected loadFromDDBB(urlConnection: string) : Component {

        return new Component({});
    }

}