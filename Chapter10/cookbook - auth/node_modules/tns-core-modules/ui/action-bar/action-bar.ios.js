function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var action_bar_common_1 = require("./action-bar-common");
var image_source_1 = require("../../image-source");
__export(require("./action-bar-common"));
var TapBarItemHandlerImpl = (function (_super) {
    __extends(TapBarItemHandlerImpl, _super);
    function TapBarItemHandlerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TapBarItemHandlerImpl.initWithOwner = function (owner) {
        var handler = TapBarItemHandlerImpl.new();
        handler._owner = owner;
        return handler;
    };
    TapBarItemHandlerImpl.prototype.tap = function (args) {
        var owner = this._owner.get();
        if (owner) {
            owner._raiseTap();
        }
    };
    TapBarItemHandlerImpl.ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
    return TapBarItemHandlerImpl;
}(NSObject));
var ActionItem = (function (_super) {
    __extends(ActionItem, _super);
    function ActionItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._ios = {
            position: "left",
            systemIcon: undefined
        };
        return _this;
    }
    Object.defineProperty(ActionItem.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        set: function (value) {
            throw new Error("ActionItem.ios is read-only");
        },
        enumerable: true,
        configurable: true
    });
    return ActionItem;
}(action_bar_common_1.ActionItemBase));
exports.ActionItem = ActionItem;
var NavigationButton = (function (_super) {
    __extends(NavigationButton, _super);
    function NavigationButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NavigationButton;
}(ActionItem));
exports.NavigationButton = NavigationButton;
var ActionBar = (function (_super) {
    __extends(ActionBar, _super);
    function ActionBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._navigationBarHeight = 0;
        return _this;
    }
    Object.defineProperty(ActionBar.prototype, "ios", {
        get: function () {
            var page = this.page;
            if (!page || !page.parent) {
                return;
            }
            var viewController = page.ios;
            if (viewController.navigationController !== null) {
                return viewController.navigationController.navigationBar;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    ActionBar.prototype.createNativeView = function () {
        return this.ios;
    };
    ActionBar.prototype._addChildFromBuilder = function (name, value) {
        if (value instanceof NavigationButton) {
            this.navigationButton = value;
        }
        else if (value instanceof ActionItem) {
            this.actionItems.addItem(value);
        }
        else if (value instanceof action_bar_common_1.View) {
            this.titleView = value;
        }
    };
    ActionBar.prototype.update = function () {
        var page = this.page;
        if (!page || !page.parent) {
            return;
        }
        var viewController = page.ios;
        var navigationItem = viewController.navigationItem;
        var navController = page.frame.ios.controller;
        var navigationBar = navController ? navController.navigationBar : null;
        var previousController;
        navigationItem.title = this.title;
        if (this.titleView && this.titleView.ios) {
            navigationItem.titleView = this.titleView.ios;
        }
        else {
            navigationItem.titleView = null;
        }
        var indexOfViewController = navController.viewControllers.indexOfObject(viewController);
        if (indexOfViewController < navController.viewControllers.count && indexOfViewController > 0) {
            previousController = navController.viewControllers[indexOfViewController - 1];
        }
        if (previousController) {
            if (this.navigationButton) {
                var tapHandler = TapBarItemHandlerImpl.initWithOwner(new WeakRef(this.navigationButton));
                var barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(this.navigationButton.text + "", 0, tapHandler, "tap");
                previousController.navigationItem.backBarButtonItem = barButtonItem;
            }
            else {
                previousController.navigationItem.backBarButtonItem = null;
            }
        }
        var img;
        if (this.navigationButton && action_bar_common_1.isVisible(this.navigationButton) && this.navigationButton.icon) {
            img = image_source_1.fromFileOrResource(this.navigationButton.icon);
        }
        if (img && img.ios) {
            var image = img.ios.imageWithRenderingMode(1);
            navigationBar.backIndicatorImage = image;
            navigationBar.backIndicatorTransitionMaskImage = image;
        }
        else {
            navigationBar.backIndicatorImage = null;
            navigationBar.backIndicatorTransitionMaskImage = null;
        }
        if (this.navigationButton) {
            navigationItem.setHidesBackButtonAnimated(!action_bar_common_1.isVisible(this.navigationButton), true);
        }
        this.populateMenuItems(navigationItem);
        this.updateColors(navigationBar);
        this.updateFlatness(navigationBar);
    };
    ActionBar.prototype.populateMenuItems = function (navigationItem) {
        var items = this.actionItems.getVisibleItems();
        var leftBarItems = [];
        var rightBarItems = [];
        for (var i = 0; i < items.length; i++) {
            var barButtonItem = this.createBarButtonItem(items[i]);
            if (items[i].ios.position === "left") {
                leftBarItems.push(barButtonItem);
            }
            else {
                rightBarItems.splice(0, 0, barButtonItem);
            }
        }
        navigationItem.setLeftBarButtonItemsAnimated(leftBarItems, false);
        navigationItem.setRightBarButtonItemsAnimated(rightBarItems, false);
        if (leftBarItems.length > 0) {
            navigationItem.leftItemsSupplementBackButton = true;
        }
    };
    ActionBar.prototype.createBarButtonItem = function (item) {
        var tapHandler = TapBarItemHandlerImpl.initWithOwner(new WeakRef(item));
        item.handler = tapHandler;
        var barButtonItem;
        if (item.actionView && item.actionView.ios) {
            var recognizer = UITapGestureRecognizer.alloc().initWithTargetAction(tapHandler, "tap");
            item.actionView.ios.addGestureRecognizer(recognizer);
            barButtonItem = UIBarButtonItem.alloc().initWithCustomView(item.actionView.ios);
        }
        else if (item.ios.systemIcon !== undefined) {
            var id = item.ios.systemIcon;
            if (typeof id === "string") {
                id = parseInt(id);
            }
            barButtonItem = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(id, tapHandler, "tap");
        }
        else if (item.icon) {
            var img = image_source_1.fromFileOrResource(item.icon);
            if (img && img.ios) {
                barButtonItem = UIBarButtonItem.alloc().initWithImageStyleTargetAction(img.ios, 0, tapHandler, "tap");
            }
            else {
                throw new Error("Error loading icon from " + item.icon);
            }
        }
        else {
            barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(item.text + "", 0, tapHandler, "tap");
        }
        if (item.text) {
            barButtonItem.isAccessibilityElement = true;
            barButtonItem.accessibilityLabel = item.text;
            barButtonItem.accessibilityTraits = UIAccessibilityTraitButton;
        }
        return barButtonItem;
    };
    ActionBar.prototype.updateColors = function (navBar) {
        var color = this.color;
        if (color) {
            navBar.titleTextAttributes = (_a = {}, _a[NSForegroundColorAttributeName] = color.ios, _a);
            navBar.tintColor = color.ios;
        }
        else {
            navBar.titleTextAttributes = null;
            navBar.tintColor = null;
        }
        var bgColor = this.backgroundColor;
        navBar.barTintColor = bgColor ? bgColor.ios : null;
        var _a;
    };
    ActionBar.prototype._onTitlePropertyChanged = function () {
        var page = this.page;
        if (!page) {
            return;
        }
        if (page.frame) {
            page.frame._updateActionBar();
        }
        var navigationItem = page.ios.navigationItem;
        navigationItem.title = this.title;
    };
    ActionBar.prototype.updateFlatness = function (navBar) {
        if (this.flat) {
            navBar.setBackgroundImageForBarMetrics(UIImage.new(), 0);
            navBar.shadowImage = UIImage.new();
            navBar.translucent = false;
        }
        else {
            navBar.setBackgroundImageForBarMetrics(null, null);
            navBar.shadowImage = null;
            navBar.translucent = true;
        }
    };
    ActionBar.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var _this = this;
        var width = action_bar_common_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = action_bar_common_1.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = action_bar_common_1.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = action_bar_common_1.layout.getMeasureSpecMode(heightMeasureSpec);
        var navBarWidth = 0;
        var navBarHeight = 0;
        var frame = this.page.frame;
        if (frame) {
            var navBar = frame.ios.controller.navigationBar;
            if (!navBar.hidden) {
                var desiredSize = action_bar_common_1.layout.measureNativeView(navBar, width, widthMode, height, heightMode);
                navBarWidth = desiredSize.width;
                navBarHeight = desiredSize.height;
            }
        }
        this._navigationBarHeight = navBarHeight;
        if (this.titleView) {
            action_bar_common_1.View.measureChild(this, this.titleView, action_bar_common_1.layout.makeMeasureSpec(width, action_bar_common_1.layout.AT_MOST), action_bar_common_1.layout.makeMeasureSpec(navBarHeight, action_bar_common_1.layout.AT_MOST));
        }
        this.actionItems.getItems().forEach(function (actionItem) {
            if (actionItem.actionView) {
                action_bar_common_1.View.measureChild(_this, actionItem.actionView, action_bar_common_1.layout.makeMeasureSpec(width, action_bar_common_1.layout.AT_MOST), action_bar_common_1.layout.makeMeasureSpec(navBarHeight, action_bar_common_1.layout.AT_MOST));
            }
        });
        this.setMeasuredDimension(navBarWidth, navBarHeight);
    };
    ActionBar.prototype.onLayout = function (left, top, right, bottom) {
        var _this = this;
        action_bar_common_1.View.layoutChild(this, this.titleView, 0, 0, right - left, this._navigationBarHeight);
        this.actionItems.getItems().forEach(function (actionItem) {
            if (actionItem.actionView && actionItem.actionView.ios) {
                var measuredWidth = actionItem.actionView.getMeasuredWidth();
                var measuredHeight = actionItem.actionView.getMeasuredHeight();
                action_bar_common_1.View.layoutChild(_this, actionItem.actionView, 0, 0, measuredWidth, measuredHeight);
            }
        });
        _super.prototype.onLayout.call(this, left, top, right, bottom);
        var navigationBar = this.ios;
        if (navigationBar) {
            navigationBar.setNeedsLayout();
        }
    };
    ActionBar.prototype.layoutNativeView = function (left, top, right, bottom) {
        return;
    };
    Object.defineProperty(ActionBar.prototype, "navBar", {
        get: function () {
            var page = this.page;
            if (!page || !page.frame) {
                return undefined;
            }
            return page.frame.ios.controller.navigationBar;
        },
        enumerable: true,
        configurable: true
    });
    ActionBar.prototype[action_bar_common_1.colorProperty.getDefault] = function () {
        return null;
    };
    ActionBar.prototype[action_bar_common_1.colorProperty.setNative] = function (color) {
        var navBar = this.navBar;
        if (color) {
            navBar.tintColor = color.ios;
            navBar.titleTextAttributes = (_a = {}, _a[NSForegroundColorAttributeName] = color.ios, _a);
        }
        else {
            navBar.tintColor = null;
            navBar.titleTextAttributes = null;
        }
        var _a;
    };
    ActionBar.prototype[action_bar_common_1.backgroundColorProperty.getDefault] = function () {
        return null;
    };
    ActionBar.prototype[action_bar_common_1.backgroundColorProperty.setNative] = function (value) {
        var navBar = this.navBar;
        if (navBar) {
            var color = value instanceof action_bar_common_1.Color ? value.ios : value;
            navBar.barTintColor = color;
        }
    };
    ActionBar.prototype[action_bar_common_1.backgroundInternalProperty.getDefault] = function () {
        return null;
    };
    ActionBar.prototype[action_bar_common_1.backgroundInternalProperty.setNative] = function (value) {
    };
    ActionBar.prototype[action_bar_common_1.flatProperty.setNative] = function (value) {
        var navBar = this.navBar;
        if (navBar) {
            this.updateFlatness(navBar);
        }
    };
    return ActionBar;
}(action_bar_common_1.ActionBarBase));
exports.ActionBar = ActionBar;
//# sourceMappingURL=action-bar.ios.js.map