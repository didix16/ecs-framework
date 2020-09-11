"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityManager = exports.entity = void 0;
var entity_1 = require("./entity");
var component_1 = require("../component/component");
var manager_1 = require("../component/manager");
var uuid_1 = require("uuid");
var events_1 = require("events");
var lodash_1 = require("lodash");
/**
 * Helper function that gets an entity instance by its uuid
 * If entity is just an instance, then return the instance
 * If entity does not exists, just returns null
 * @param id
 */
function entity(id) {
    if (id instanceof entity_1.Entity)
        return id;
    return EntityManager.getInstance().find(id);
}
exports.entity = entity;
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
var EntityManager = /** @class */ (function (_super) {
    __extends(EntityManager, _super);
    function EntityManager() {
        var _this = _super.call(this) || this;
        _this.entities = {};
        return _this;
    }
    EntityManager.getInstance = function () {
        if (!EntityManager.instance) {
            EntityManager.instance = new EntityManager();
        }
        return EntityManager.instance;
    };
    /**
     * Given a entity id string or Entity instance, return the entity id
     * @param id
     */
    EntityManager.prototype.getEntityId = function (id) {
        return entity_1.getEntityId(id);
    };
    /**
     * Given an entity id, checks if that entity exists
     * @param id
     */
    EntityManager.prototype.exists = function (id) {
        return this.entities[id] instanceof entity_1.Entity;
    };
    /**
     * Create a new Entity. If entity already exists, just return the existing entity
     * Emits a [entity.created] event on create
     * @param id
     */
    EntityManager.prototype.entity = function (id) {
        if (!id) {
            id = uuid_1.v4();
        }
        if (!this.exists(id)) {
            this.entities[id] = new entity_1.Entity(id);
            this.emit(EntityManager.EV_ENTITY_CREATED, id);
        }
        return this.entities[id];
    };
    /**
     * Given an entity id, return the instance of the entity.
     * If doest not exists, then null is returned
     * @param id
     */
    EntityManager.prototype.find = function (id) {
        var _a;
        return (_a = this.entities[id]) !== null && _a !== void 0 ? _a : null;
    };
    /**
     * Removes an entity from this manager
     * Returns true if the entity trying to remove exists, else false
     * Emits a [entity.deleted] event on delete
     * @param id
     */
    EntityManager.prototype.deleteEntity = function (id) {
        id = this.getEntityId(id);
        if (this.exists(id)) {
            this.emit(EntityManager.EV_ENTITY_DELETED, this.entities[id]);
            delete this.entities[id];
            return true;
        }
        return false;
    };
    /**
     * Returns an array of all entities this manager has
     */
    EntityManager.prototype.all = function () {
        return Object.values(this.entities);
    };
    /**
     * Get those entities that has all passed components
     * @param components
     */
    EntityManager.prototype.findByComponents = function (components) {
        return lodash_1.default.filter(this.all(), function (entity) {
            return lodash_1.default.size(lodash_1.default.pick(entity.components, components)) === components.length;
        });
    };
    /**
     * Given an entity and a component, add it to the entity.
     * If enity already has the component does nothing, else add it to the entity
     * Emits a [component.added] event on add
     * Returns self for fluent
     * @param component
     */
    EntityManager.prototype.addComponent = function (entity, component, data) {
        entity = this.getEntityId(entity);
        if (!this.hasComponent(entity, component)) {
            this.entities[entity].components[component] = manager_1.build(component, data);
            this.emit(EntityManager.EV_COMPONENT_ADDED, entity, component);
        }
        return this;
    };
    /**
     * Given an entity and a component name, check if that entity has the component
     * Return true if has, false in any other case ( includes errors like non existance )
     * @param entity
     * @param component
     */
    EntityManager.prototype.hasComponent = function (entity, component) {
        entity = this.getEntityId(entity);
        return this.entities[entity].components[component] instanceof component_1.Component;
    };
    /**
     * Given an entity and a component name, removes that component from the entity
     * If entity does not have the component, does nothing, else removes
     * Emits a [component.removed] event on remove
     * Return self for fluent
     * @param entity
     * @param component
     */
    EntityManager.prototype.removeComponent = function (entity, component) {
        entity = this.getEntityId(entity);
        if (this.hasComponent(entity, component)) {
            delete this.entities[entity].components[component];
            this.emit(EntityManager.EV_COMPONENT_REMOVED, entity, component);
        }
        return this;
    };
    /* Events */
    EntityManager.EV_ENTITY_CREATED = 'entity.created';
    EntityManager.EV_ENTITY_DELETED = 'entity.deleted';
    EntityManager.EV_COMPONENT_ADDED = 'component.added';
    EntityManager.EV_COMPONENT_REMOVED = 'component.removed';
    return EntityManager;
}(events_1.EventEmitter));
exports.EntityManager = EntityManager;
//# sourceMappingURL=manager.js.map