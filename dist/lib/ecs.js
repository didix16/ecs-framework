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
exports.ECS = void 0;
var manager_1 = require("./entity/manager");
var manager_2 = require("./component/manager");
var manager_3 = require("./system/manager");
var events_1 = require("events");
var lodash_1 = require("lodash");
var RUN_STATUS;
(function (RUN_STATUS) {
    RUN_STATUS[RUN_STATUS["Stopped"] = 0] = "Stopped";
    RUN_STATUS[RUN_STATUS["Running"] = 1] = "Running";
    RUN_STATUS[RUN_STATUS["Paused"] = 2] = "Paused";
})(RUN_STATUS || (RUN_STATUS = {}));
var ECS = /** @class */ (function (_super) {
    __extends(ECS, _super);
    function ECS() {
        var _this = _super.call(this) || this;
        _this.FPS = 60.0;
        _this.MS_PER_UPDATE = 0;
        _this.useFps = false;
        _this.status = RUN_STATUS.Stopped;
        _this.em = manager_1.EntityManager.getInstance();
        _this.cm = manager_2.ComponentManager.getInstance();
        _this.sm = manager_3.SystemManager.getInstance();
        _this.MS_PER_UPDATE = 1000.0 / _this.FPS;
        _this.registerEvents();
        return _this;
    }
    /**
     * If ECS.DEBUG is set to true, then prints the msg into console
     * @param msg
     */
    ECS.prototype.debug = function (msg) {
        if (ECS.DEBUG)
            console.log("[DEBUG]:: " + msg);
    };
    /**
     * Register events listeners for all managers
     */
    ECS.prototype.registerEvents = function () {
        var _this = this;
        this.em.on(manager_1.EntityManager.EV_ENTITY_CREATED, function (entityId) {
            _this.debug("entity created: " + entityId);
        });
        this.em.on(manager_1.EntityManager.EV_ENTITY_DELETED, function (entity) {
            // remove entity from all posible systems
            _this.sm.all().forEach(function (system) {
                _this.sm.dettachEntity(system.name, entity);
            });
        });
        this.em.on(manager_1.EntityManager.EV_COMPONENT_ADDED, function (entityId, componentName) {
            // find systems by component and attach entity to them
            _this.sm.findByComponents([componentName]).forEach(function (system) {
                _this.sm.attachEntity(system.name, _this.em.find(entityId));
            });
        });
        this.em.on(manager_1.EntityManager.EV_COMPONENT_REMOVED, function (entityId, componentName) {
            // remove the entity from all systems that use that component
            _this.sm.findByComponents([componentName]).forEach(function (system) {
                _this.sm.dettachEntity(system.name, _this.em.find(entityId));
            });
        });
        this.cm.on(manager_2.ComponentManager.EV_COMPONENT_CREATED, function (componentName) {
            _this.debug("component created: " + componentName);
        });
        this.cm.on(manager_2.ComponentManager.EV_COMPONENT_DELETED, function (componentName) {
            // no longer exists in memory, so it cannot be founded and assing to any entity
            // however, components added previously still exists till its dettachment
            _this.debug("component deleted: " + componentName);
        });
        this.sm.on(manager_3.SystemManager.EV_SYSTEM_CREATED, function (systemName) {
            _this.debug("system created: " + systemName);
            // attach those entitites that are compatible with the new system
            _this.em.findByComponents(manager_3.system(systemName).requiredComponents).forEach(function (entity) {
                _this.sm.attachEntity(systemName, entity);
            });
        });
        this.sm.on(manager_3.SystemManager.EV_SYSTEM_DELETED, function (systemName) {
            _this.debug("system deleted: " + systemName);
        });
        this.sm.on(manager_3.SystemManager.EV_ENTITY_ATTACHED, function (entityId, systemName) {
            _this.debug("entity " + entityId + " attached to " + systemName + " system");
        });
        this.sm.on(manager_3.SystemManager.EV_ENTITY_DETTACHED, function (entityId, systemName) {
            _this.debug("entity " + entityId + " dettached from " + systemName + " system");
        });
    };
    /**
     * Generates a new entity and returns it
     * If entity already exists, just returns it
     * @param id
     */
    ECS.prototype.entity = function (id) {
        return this.em.entity(id);
    };
    /**
     * Deletes an existing entity
     * @param id
     */
    ECS.prototype.deleteEntity = function (id) {
        this.em.deleteEntity(id);
        return this;
    };
    /**
     * Add existing components to the specified entity
     * @param entity
     * @param components
     */
    ECS.prototype.addComponents = function (entity, components, data) {
        var _this = this;
        if (lodash_1.default.isUndefined(data))
            data = [];
        components.forEach(function (component, idx) {
            var _a;
            if (_this.cm.exists(component)) {
                _this.em.addComponent(entity, component, (_a = data[idx]) !== null && _a !== void 0 ? _a : {});
            }
            else
                throw new Error("Component " + component + " does not exists!");
        });
        return this;
    };
    /**
     * Remove components from the specified entity
     * @param entity
     * @param components
     */
    ECS.prototype.removeComponents = function (entity, components) {
        var _this = this;
        components.forEach(function (component) {
            _this.em.removeComponent(entity, component);
        });
        return this;
    };
    /**
     * Generates a new component and returns it.
     * If component already exists, just returns it
     * @param name
     * @param data
     */
    ECS.prototype.component = function (name, data) {
        return this.cm.component(name, data);
    };
    /**
     * Removes an existing component from in-memory
     * NOTE: Assigned components to entities will not be removed!
     * @param name
     */
    ECS.prototype.deleteComponent = function (name) {
        this.cm.deleteComponent(name);
        return this;
    };
    /**
     * Generates a new system and returns it.
     * If system already exists, just returns it
     * @param name
     * @param components
     * @param handle
     */
    ECS.prototype.system = function (name, components, handle) {
        return this.sm.system(name, components, handle);
    };
    /**
     * Deletes an existing system
     * @param name
     */
    ECS.prototype.deleteSystem = function (name) {
        this.sm.deleteSystem(name);
        return this;
    };
    /**
     * Adds an entity to a system.
     * The entity will be attached only if has required components for that system
     * @param system
     * @param entity
     * @throws if already attached or system incompatible
     */
    ECS.prototype.attachEntity = function (system, entity) {
        if (!this.sm.exists(system)) {
            throw new Error("System " + system + " does not exists!");
        }
        var e = manager_1.entity(entity);
        if (!e)
            throw new Error("Entity " + entity + " does not exists");
        var result = this.sm.attachEntity(system, e);
        if (!result) {
            var components = manager_3.system(system).requiredComponents.join(",");
            throw new Error("Entity could not be attached because is already attached or system incompatible. Required components are: [" + components + "]");
        }
        return this;
    };
    ECS.prototype.dettachEntity = function (system, entity) {
        if (!this.sm.exists(system)) {
            throw new Error("System " + system + " does not exists!");
        }
        var e = manager_1.entity(entity);
        if (!e)
            throw new Error("Entity " + entity + " does not exists");
        this.sm.dettachEntity(system, e);
        return this;
    };
    /**
     * Runs one loop for all existings systems calling its update method
     * Emits [EV_BEFORE_TICK, EV_AFTER_TICK] events wich payload are the systems
     */
    ECS.prototype.tick = function () {
        var systems = this.sm.all();
        this.emit(ECS.EV_BEFORE_TICK, systems);
        systems.forEach(function (system) { return system.update(); });
        this.emit(ECS.EV_AFTER_TICK, systems);
    };
    /**
     * Run loop with fps
     */
    ECS.prototype.runWithFPS = function () {
        var previous = Date.now();
        while (this.status === RUN_STATUS.Running || this.status === RUN_STATUS.Paused) {
            var current = Date.now();
            var elapsed = current - previous;
            if (this.status === RUN_STATUS.Running && elapsed >= this.MS_PER_UPDATE) {
                this.tick();
            }
            previous = current;
        }
    };
    /**
     * Run loop without FPS. Runs at machine speed
     */
    ECS.prototype.runWithoutFPS = function () {
        while (this.status === RUN_STATUS.Running || this.status === RUN_STATUS.Paused) {
            this.tick();
        }
    };
    /**
     * Runs ECS loop
     * Emits [ecs:run] event
     */
    ECS.prototype.run = function () {
        this.status = RUN_STATUS.Running;
        this.emit(ECS.EV_RUN, this);
        if (this.useFps) {
            this.runWithFPS();
        }
        else {
            this.runWithoutFPS();
        }
    };
    /**
     * Pauses the ECS loop
     * Emits [ecs:pause] event
     */
    ECS.prototype.pause = function () {
        this.status = RUN_STATUS.Paused;
        this.emit(ECS.EV_PAUSE, this);
        return this;
    };
    /**
     * Stops the ECS loop
     * Emits [ecs:stop] event
     */
    ECS.prototype.stop = function () {
        this.status = RUN_STATUS.Stopped;
        this.emit(ECS.EV_STOP, this);
        return this;
    };
    ECS.DEBUG = true;
    ECS.EV_BEFORE_TICK = 'ecs:before.tick';
    ECS.EV_AFTER_TICK = 'ecs:after.tick';
    ECS.EV_RUN = 'ecs:run';
    ECS.EV_PAUSE = 'ecs:pause';
    ECS.EV_STOP = 'ecs:stop';
    return ECS;
}(events_1.EventEmitter));
exports.ECS = ECS;
//# sourceMappingURL=ecs.js.map