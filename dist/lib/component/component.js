"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
var Component = /** @class */ (function () {
    function Component(data) {
        Object.assign(this, data);
    }
    Component.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return Component;
}());
exports.Component = Component;
//# sourceMappingURL=component.js.map