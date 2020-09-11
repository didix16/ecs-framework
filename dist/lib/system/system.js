"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
var lodash_1 = require("lodash");
var System = /** @class */ (function () {
    function System(name, requiredComponents, handle) {
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
    System.prototype.update = function () {
        var _this = this;
        lodash_1.default.each(this.entities, function (entity) {
            _this.handle(entity.id, lodash_1.default.pick(entity.components, _this.requiredComponents));
        });
    };
    return System;
}());
exports.System = System;
//# sourceMappingURL=system.js.map