Object.defineProperty(exports, "__esModule", { value: true });
require("./decorators");
global.__extends = global.__extends || function (d, b) {
    for (var p in b) {
        if (b.hasOwnProperty(p)) {
            d[p] = b[p];
        }
    }
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
global.moduleMerge = function (sourceExports, destExports) {
    for (var key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
};
var modules = new Map();
global.registerModule = function (name, loader) {
    modules.set(name, loader);
};
global.moduleExists = function (name) {
    return modules.has(name);
};
global.loadModule = function (name) {
    var loader = modules.get(name);
    if (loader) {
        return loader();
    }
    else {
        var result_1 = global.require(name);
        modules.set(name, function () { return result_1; });
        return result_1;
    }
};
global.zonedCallback = function (callback) {
    if (global.zone) {
        return global.zone.bind(callback);
    }
    if (global.Zone) {
        return global.Zone.current.wrap(callback);
    }
    else {
        return callback;
    }
};
global.registerModule("timer", function () { return require("timer"); });
global.registerModule("ui/dialogs", function () { return require("ui/dialogs"); });
global.registerModule("xhr", function () { return require("xhr"); });
global.registerModule("fetch", function () { return require("fetch"); });
var __tnsGlobalMergedModules = new Map();
function registerOnGlobalContext(name, module) {
    Object.defineProperty(global, name, {
        get: function () {
            var m = global.loadModule(module);
            if (!__tnsGlobalMergedModules.has(module)) {
                __tnsGlobalMergedModules.set(module, true);
                global.moduleMerge(m, global);
            }
            var resolvedValue = m[name];
            Object.defineProperty(this, name, { value: resolvedValue, configurable: true, writable: true });
            return resolvedValue;
        },
        configurable: true
    });
}
var snapshotGlobals;
function install() {
    if (global.__snapshot || global.__snapshotEnabled) {
        if (!snapshotGlobals) {
            var timer = require("timer");
            var dialogs = require("ui/dialogs");
            var xhr = require("xhr");
            var fetch = require("fetch");
            var consoleModule = require("console");
            snapshotGlobals = snapshotGlobals || {
                setTimeout: timer.setTimeout,
                clearTimeout: timer.clearTimeout,
                setInterval: timer.setInterval,
                clearInterval: timer.clearInterval,
                alert: dialogs.alert,
                confirm: dialogs.confirm,
                prompt: dialogs.prompt,
                XMLHttpRequest: xhr.XMLHttpRequest,
                FormData: xhr.FormData,
                fetch: fetch.fetch,
                Headers: fetch.Headers,
                Request: fetch.Request,
                Response: fetch.Response,
                console: new consoleModule.Console()
            };
        }
        Object.assign(global, snapshotGlobals);
    }
    else {
        registerOnGlobalContext("setTimeout", "timer");
        registerOnGlobalContext("clearTimeout", "timer");
        registerOnGlobalContext("setInterval", "timer");
        registerOnGlobalContext("clearInterval", "timer");
        registerOnGlobalContext("alert", "ui/dialogs");
        registerOnGlobalContext("confirm", "ui/dialogs");
        registerOnGlobalContext("prompt", "ui/dialogs");
        registerOnGlobalContext("XMLHttpRequest", "xhr");
        registerOnGlobalContext("FormData", "xhr");
        registerOnGlobalContext("fetch", "fetch");
        if (global.android) {
            var consoleModule_1 = require("console");
            global.console = new consoleModule_1.Console();
        }
    }
}
exports.install = install;
install();
function Deprecated(target, key, descriptor) {
    if (descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log(key + " is deprecated");
            return originalMethod.apply(this, args);
        };
        return descriptor;
    }
    else {
        console.log((target && target.name || target) + " is deprecated");
        return target;
    }
}
exports.Deprecated = Deprecated;
global.Deprecated = Deprecated;
function Experimental(target, key, descriptor) {
    if (descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log(key + " is experimental");
            return originalMethod.apply(this, args);
        };
        return descriptor;
    }
    else {
        console.log((target && target.name || target) + " is experimental");
        return target;
    }
}
exports.Experimental = Experimental;
global.Experimental = Experimental;
//# sourceMappingURL=globals.js.map