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
exports.ComponentManager = exports.build = exports.component = void 0;
var component_1 = require("./component");
var events_1 = require("events");
var lodash_1 = require("lodash");
function component(name) {
    return ComponentManager.getInstance().find(name);
}
exports.component = component;
function build(name, data) {
    return ComponentManager.getInstance().build(name, data);
}
exports.build = build;
/**
 * Manager that holds all runtime components
 * It creates and destroy the components
 * Emit events in function of:
 *  - component creation
 *  - component deletion
 *
 * @class ComponentManager
 */
var ComponentManager = /** @class */ (function (_super) {
    __extends(ComponentManager, _super);
    function ComponentManager() {
        var _this = _super.call(this) || this;
        _this.components = {};
        return _this;
    }
    ComponentManager.getInstance = function () {
        if (!ComponentManager.instance) {
            ComponentManager.instance = new ComponentManager();
        }
        return ComponentManager.instance;
    };
    /**
     * Given a component name, check if that component exists
     * @param name
     */
    ComponentManager.prototype.exists = function (name) {
        return typeof this.components[name] !== "undefined";
    };
    /**
     * Returns an array of all components this manager has
     */
    ComponentManager.prototype.all = function () {
        return Object.values(this.components);
    };
    /**
     * Find and return a copy of component by its name.
     * If does not exists then just returns null
     * @param name
     */
    ComponentManager.prototype.find = function (name) {
        return this.components[name] ? lodash_1.default.clone(this.components[name]) : null;
    };
    /**
     * A factory method for build existing components with given data instead of default data
     * @param name
     * @param data
     */
    ComponentManager.prototype.build = function (name, data) {
        var comp = this.find(name);
        if (lodash_1.default.isUndefined(data) || lodash_1.default.isEmpty(data))
            return comp;
        return lodash_1.default.assign(comp, lodash_1.default.pick(data, lodash_1.default.keys(comp)));
    };
    /**
     * Create a new Component. If component already exists, just return the existing component
     * Emits a [component.created] event on create
     * @param name
     * @param data
     */
    ComponentManager.prototype.component = function (name, data) {
        if (!this.exists(name)) {
            this.components[name] = new component_1.Component(data);
            this.emit(ComponentManager.EV_COMPONENT_CREATED, name);
        }
        return lodash_1.default.clone(this.components[name]);
    };
    /**
     * Removes a component from this manager
     * Returns true if the component trying to remove exists, else false
     * Emits a [component.deleted] event on delete
     * @param name
     */
    ComponentManager.prototype.deleteComponent = function (name) {
        if (this.exists(name)) {
            delete this.components[name];
            this.emit(ComponentManager.EV_COMPONENT_DELETED, name);
            return true;
        }
        return false;
    };
    /* Events */
    ComponentManager.EV_COMPONENT_CREATED = 'component.created';
    ComponentManager.EV_COMPONENT_DELETED = 'component.deleted';
    return ComponentManager;
}(events_1.EventEmitter));
exports.ComponentManager = ComponentManager;
//# sourceMappingURL=manager.js.map