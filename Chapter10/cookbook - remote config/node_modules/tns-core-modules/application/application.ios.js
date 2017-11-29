function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var application_common_1 = require("./application-common");
__export(require("./application-common"));
var frame_1 = require("../ui/frame");
var utils_1 = require("../ui/utils");
var utils = require("../utils/utils");
var Responder = (function (_super) {
    __extends(Responder, _super);
    function Responder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Responder;
}(UIResponder));
var displayedOnce = false;
var Window = (function (_super) {
    __extends(Window, _super);
    function Window() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Window.prototype.initWithFrame = function (frame) {
        var window = _super.prototype.initWithFrame.call(this, frame);
        if (window) {
            window.autoresizingMask = 0;
        }
        return window;
    };
    Window.prototype.layoutSubviews = function () {
        if (utils.ios.MajorVersion < 9) {
            utils_1.ios._layoutRootView(this.content, utils.ios.getter(UIScreen, UIScreen.mainScreen).bounds);
        }
        else {
            utils_1.ios._layoutRootView(this.content, this.frame);
        }
    };
    return Window;
}(UIWindow));
var NotificationObserver = (function (_super) {
    __extends(NotificationObserver, _super);
    function NotificationObserver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NotificationObserver.initWithCallback = function (onReceiveCallback) {
        var observer = _super.new.call(this);
        observer._onReceiveCallback = onReceiveCallback;
        return observer;
    };
    NotificationObserver.prototype.onReceive = function (notification) {
        this._onReceiveCallback(notification);
    };
    NotificationObserver.ObjCExposedMethods = {
        "onReceive": { returns: interop.types.void, params: [NSNotification] }
    };
    return NotificationObserver;
}(NSObject));
var IOSApplication = (function () {
    function IOSApplication() {
        this._currentOrientation = utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;
        this._observers = new Array();
        this.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, this.didFinishLaunchingWithOptions.bind(this));
        this.addNotificationObserver(UIApplicationDidBecomeActiveNotification, this.didBecomeActive.bind(this));
        this.addNotificationObserver(UIApplicationDidEnterBackgroundNotification, this.didEnterBackground.bind(this));
        this.addNotificationObserver(UIApplicationWillTerminateNotification, this.willTerminate.bind(this));
        this.addNotificationObserver(UIApplicationDidReceiveMemoryWarningNotification, this.didReceiveMemoryWarning.bind(this));
        this.addNotificationObserver(UIDeviceOrientationDidChangeNotification, this.orientationDidChange.bind(this));
    }
    Object.defineProperty(IOSApplication.prototype, "nativeApp", {
        get: function () {
            return utils.ios.getter(UIApplication, UIApplication.sharedApplication);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IOSApplication.prototype, "window", {
        get: function () {
            return this._window;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IOSApplication.prototype, "delegate", {
        get: function () {
            return this._delegate;
        },
        set: function (value) {
            if (this._delegate !== value) {
                this._delegate = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    IOSApplication.prototype.addNotificationObserver = function (notificationName, onReceiveCallback) {
        var observer = NotificationObserver.initWithCallback(onReceiveCallback);
        utils.ios.getter(NSNotificationCenter, NSNotificationCenter.defaultCenter).addObserverSelectorNameObject(observer, "onReceive", notificationName, null);
        this._observers.push(observer);
        return observer;
    };
    IOSApplication.prototype.removeNotificationObserver = function (observer, notificationName) {
        var index = this._observers.indexOf(observer);
        if (index >= 0) {
            this._observers.splice(index, 1);
            utils.ios.getter(NSNotificationCenter, NSNotificationCenter.defaultCenter).removeObserverNameObject(observer, notificationName, null);
        }
    };
    IOSApplication.prototype.didFinishLaunchingWithOptions = function (notification) {
        this._window = Window.alloc().initWithFrame(utils.ios.getter(UIScreen, UIScreen.mainScreen).bounds);
        this._window.backgroundColor = utils.ios.getter(UIColor, UIColor.whiteColor);
        var args = {
            eventName: application_common_1.launchEvent,
            object: this,
            ios: notification.userInfo && notification.userInfo.objectForKey("UIApplicationLaunchOptionsLocalNotificationKey") || null
        };
        application_common_1.notify(args);
        var rootView = createRootView(args.root);
        this._window.content = rootView;
        if (rootView instanceof frame_1.Frame) {
            this.rootController = this._window.rootViewController = rootView.ios.controller;
        }
        else if (rootView.ios instanceof UIViewController) {
            this.rootController = this._window.rootViewController = rootView.ios;
        }
        else if (rootView.ios instanceof UIView) {
            var newController = UIViewController.new();
            newController.view.addSubview(rootView.ios);
            this.rootController = newController;
        }
        else {
            throw new Error("Root should be either UIViewController or UIView");
        }
        this._window.makeKeyAndVisible();
    };
    IOSApplication.prototype.didBecomeActive = function (notification) {
        var ios = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
        var object = this;
        application_common_1.notify({ eventName: application_common_1.resumeEvent, object: object, ios: ios });
        if (!displayedOnce) {
            application_common_1.notify({ eventName: application_common_1.displayedEvent, object: object, ios: ios });
            displayedOnce = true;
        }
    };
    IOSApplication.prototype.didEnterBackground = function (notification) {
        application_common_1.notify({ eventName: application_common_1.suspendEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
    };
    IOSApplication.prototype.willTerminate = function (notification) {
        application_common_1.notify({ eventName: application_common_1.exitEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
    };
    IOSApplication.prototype.didReceiveMemoryWarning = function (notification) {
        application_common_1.notify({ eventName: application_common_1.lowMemoryEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
    };
    IOSApplication.prototype.orientationDidChange = function (notification) {
        var orientation = utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;
        if (this._currentOrientation !== orientation) {
            this._currentOrientation = orientation;
            var newValue = void 0;
            switch (orientation) {
                case 4:
                case 3:
                    newValue = "landscape";
                    break;
                case 1:
                case 2:
                    newValue = "portrait";
                    break;
                default:
                    newValue = "unknown";
                    break;
            }
            application_common_1.notify({
                eventName: application_common_1.orientationChangedEvent,
                ios: this,
                newValue: newValue,
                object: this
            });
        }
    };
    return IOSApplication;
}());
var iosApp = new IOSApplication();
exports.ios = iosApp;
application_common_1.setApplication(iosApp);
var mainEntry;
function createRootView(v) {
    var rootView = v;
    var frame;
    var main;
    if (!rootView) {
        main = mainEntry;
        if (main) {
            frame = new frame_1.Frame();
            frame.navigate(main);
        }
        else {
            throw new Error("A Frame must be used to navigate to a Page.");
        }
        rootView = frame;
    }
    rootView._setupAsRootView({});
    return rootView;
}
function getMainEntry() {
    return mainEntry;
}
exports.getMainEntry = getMainEntry;
var started = false;
function start(entry) {
    mainEntry = typeof entry === "string" ? { moduleName: entry } : entry;
    started = true;
    if (!iosApp.nativeApp) {
        UIApplicationMain(0, null, null, iosApp && iosApp.delegate ? NSStringFromClass(iosApp.delegate) : NSStringFromClass(Responder));
    }
    else {
        var rootView = createRootView();
        if (rootView) {
            var window = iosApp.nativeApp.keyWindow || (iosApp.nativeApp.windows.count > 0 && iosApp.nativeApp.windows[0]);
            if (window) {
                var rootController = window.rootViewController;
                if (rootController) {
                    rootController.presentViewControllerAnimatedCompletion(rootView.ios.controller, true, null);
                    utils_1.ios._layoutRootView(rootView, utils.ios.getter(UIScreen, UIScreen.mainScreen).bounds);
                }
            }
        }
    }
}
exports.start = start;
function getNativeApplication() {
    return iosApp.nativeApp;
}
exports.getNativeApplication = getNativeApplication;
global.__onLiveSync = function () {
    if (!started) {
        return;
    }
    application_common_1.livesync();
};
//# sourceMappingURL=application.ios.js.map