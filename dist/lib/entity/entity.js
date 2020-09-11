"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = exports.getEntityId = void 0;
function getEntityId(id) {
    return id + '';
}
exports.getEntityId = getEntityId;
var Entity = /** @class */ (function () {
    function Entity(id) {
        this.id = id;
        this.components = {};
    }
    Entity.prototype.toString = function () {
        return this.id;
    };
    return Entity;
}());
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map