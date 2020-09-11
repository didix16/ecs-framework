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
exports.SystemManager = exports.system = void 0;
var system_1 = require("./system");
var events_1 = require("events");
var entity_1 = require("../entity/entity");
var lodash_1 = require("lodash");
function system(name) {
    return SystemManager.getInstance().find(name);
}
exports.system = system;
/**
 * Manager that holds all systems. Ensures that a system only iterates over
 * the entities that has the required components.
 * Emits events in function of:
 *  - system creation
 *  - system deletion
 *  - entity attachment to a system
 *  - entity dettachment from a system
 *
 * @class SystemManager
 */
var SystemManager = /** @class */ (function (_super) {
    __extends(SystemManager, _super);
    function SystemManager() {
        var _this = _super.call(this) || this;
        _this.systems = {};
        return _this;
    }
    SystemManager.getInstance = function () {
        if (!SystemManager.instance) {
            SystemManager.instance = new SystemManager();
        }
        return SystemManager.instance;
    };
    /**
     * Given a system name, check if that system exists
     * @param name
     */
    SystemManager.prototype.exists = function (name) {
        return this.systems[name] instanceof system_1.System;
    };
    /**
     * Returns an array of all systems this manager has
     */
    SystemManager.prototype.all = function () {
        return Object.values(this.systems);
    };
    /**
     * Given a system key name, return the system instance if exists
     * If not exists, null is returned
     * @param id
     */
    SystemManager.prototype.find = function (name) {
        var _a;
        return (_a = this.systems[name]) !== null && _a !== void 0 ? _a : null;
    };
    /**
     * Return those systems that has all passed components
     * @param components
     */
    SystemManager.prototype.findByComponents = function (components) {
        return lodash_1.default.filter(this.all(), function (system) {
            return lodash_1.default.intersection(system.requiredComponents, components).length === components.length;
        });
    };
    /**
     * Create a new System. If system already exists, just return the existing system
     * Emits a [system.created] event on create
     *
     * @param name
     * @param handle
     */
    SystemManager.prototype.system = function (name, requiredComponents, handle) {
        if (!this.exists(name)) {
            this.systems[name] = new system_1.System(name, requiredComponents, handle);
            this.emit(SystemManager.EV_SYSTEM_CREATED, name);
        }
        return this.systems[name];
    };
    /**
     * Given a system key name and an entity instance, try to attach entity to system
     * If could be attach, returns true, else false
     * Emits a [entity.attached] event on attach
     *
     * @pre System and Entity exists
     * @param system
     * @param entity
     */
    SystemManager.prototype.attachEntity = function (system, entity) {
        if (!this.hasEntity(system, entity) && this.validEntity(system, entity)) {
            this.systems[system].entities[entity.id] = entity;
            this.emit(SystemManager.EV_ENTITY_ATTACHED, entity.id, system);
            return true;
        }
        return false;
    };
    /**
     * Given a system key name and an entity instance, try to dettach entity from system
     * If entity is dettached, returns true, else false
     * Emits a [entity.dettached] event on dettach
     *
     * @param system
     * @param entity
     */
    SystemManager.prototype.dettachEntity = function (system, entity) {
        if (this.hasEntity(system, entity)) {
            delete this.systems[system].entities[entity.id];
            this.emit(SystemManager.EV_ENTITY_DETTACHED, entity.id, system);
            return true;
        }
        return false;
    };
    /**
     * Given a system key name and an entity, check if that entity is already in the system
     *
     * @pre System exists
     * @param system
     * @param entity
     */
    SystemManager.prototype.hasEntity = function (system, entity) {
        return this.systems[system].entities[entity.id] instanceof entity_1.Entity;
    };
    /**
     * Check if the entity has all requirements to be added to system
     *
     * @pre System exists
     * @param entity
     */
    SystemManager.prototype.validEntity = function (system, entity) {
        var requiredComps = this.systems[system].requiredComponents;
        var reqCompsLen = requiredComps.length;
        return lodash_1.default.size(lodash_1.default.pick(entity.components, requiredComps)) === reqCompsLen;
    };
    /**
     * Removes a system from this manager
     * Returns true if the system trying to remove exists, else false
     * Emits a [system.deleted] event on delete
     * @param name
     */
    SystemManager.prototype.deleteSystem = function (name) {
        if (this.exists(name)) {
            delete this.systems[name];
            this.emit(SystemManager.EV_SYSTEM_DELETED, name);
            return true;
        }
        return false;
    };
    /* Events */
    SystemManager.EV_SYSTEM_CREATED = 'system.created';
    SystemManager.EV_SYSTEM_DELETED = 'system.deleted';
    SystemManager.EV_ENTITY_ATTACHED = 'entity.attached';
    SystemManager.EV_ENTITY_DETTACHED = 'entity.dettached';
    return SystemManager;
}(events_1.EventEmitter));
exports.SystemManager = SystemManager;
//# sourceMappingURL=manager.js.map