function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var tab_view_common_1 = require("./tab-view-common");
var text_base_1 = require("../text-base");
var image_source_1 = require("../../image-source");
var profiling_1 = require("../../profiling");
__export(require("./tab-view-common"));
var UITabBarControllerImpl = (function (_super) {
    __extends(UITabBarControllerImpl, _super);
    function UITabBarControllerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UITabBarControllerImpl.initWithOwner = function (owner) {
        var handler = UITabBarControllerImpl.new();
        handler._owner = owner;
        return handler;
    };
    UITabBarControllerImpl.prototype.viewDidLayoutSubviews = function () {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.UITabBarControllerClass.viewDidLayoutSubviews();", tab_view_common_1.traceCategories.Debug);
        }
        _super.prototype.viewDidLayoutSubviews.call(this);
        var owner = this._owner.get();
        if (owner && owner.isLoaded) {
            owner._updateLayout();
        }
    };
    return UITabBarControllerImpl;
}(UITabBarController));
var UITabBarControllerDelegateImpl = (function (_super) {
    __extends(UITabBarControllerDelegateImpl, _super);
    function UITabBarControllerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UITabBarControllerDelegateImpl.initWithOwner = function (owner) {
        var delegate = UITabBarControllerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UITabBarControllerDelegateImpl.prototype.tabBarControllerShouldSelectViewController = function (tabBarController, viewController) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", tab_view_common_1.traceCategories.Debug);
        }
        var owner = this._owner.get();
        if (owner) {
            var backToMoreWillBeVisible = false;
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }
        return true;
    };
    UITabBarControllerDelegateImpl.prototype.tabBarControllerDidSelectViewController = function (tabBarController, viewController) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.delegate.DID_select(" + tabBarController + ", " + viewController + ");", tab_view_common_1.traceCategories.Debug);
        }
        var owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
    };
    UITabBarControllerDelegateImpl.ObjCProtocols = [UITabBarControllerDelegate];
    return UITabBarControllerDelegateImpl;
}(NSObject));
var UINavigationControllerDelegateImpl = (function (_super) {
    __extends(UINavigationControllerDelegateImpl, _super);
    function UINavigationControllerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UINavigationControllerDelegateImpl.initWithOwner = function (owner) {
        var delegate = UINavigationControllerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UINavigationControllerDelegateImpl.prototype.navigationControllerWillShowViewControllerAnimated = function (navigationController, viewController, animated) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.moreNavigationController.WILL_show(" + navigationController + ", " + viewController + ", " + animated + ");", tab_view_common_1.traceCategories.Debug);
        }
        var owner = this._owner.get();
        if (owner) {
            var backToMoreWillBeVisible = owner._ios.viewControllers.containsObject(viewController);
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }
    };
    UINavigationControllerDelegateImpl.prototype.navigationControllerDidShowViewControllerAnimated = function (navigationController, viewController, animated) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.moreNavigationController.DID_show(" + navigationController + ", " + viewController + ", " + animated + ");", tab_view_common_1.traceCategories.Debug);
        }
        navigationController.navigationBar.topItem.rightBarButtonItem = null;
        var owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
    };
    UINavigationControllerDelegateImpl.ObjCProtocols = [UINavigationControllerDelegate];
    return UINavigationControllerDelegateImpl;
}(NSObject));
function updateItemTitlePosition(tabBarItem) {
    if (typeof tabBarItem.setTitlePositionAdjustment === "function") {
        tabBarItem.setTitlePositionAdjustment({ horizontal: 0, vertical: -20 });
    }
    else {
        tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: -20 };
    }
}
function updateItemIconPosition(tabBarItem) {
    tabBarItem.imageInsets = new UIEdgeInsets({ top: 6, left: 0, bottom: -6, right: 0 });
}
var TabViewItem = (function (_super) {
    __extends(TabViewItem, _super);
    function TabViewItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabViewItem.prototype.setViewController = function (controller) {
        this._iosViewController = controller;
        this.setNativeView(this._nativeView = controller.view);
    };
    TabViewItem.prototype.disposeNativeView = function () {
        this._iosViewController = undefined;
        this.setNativeView(undefined);
    };
    TabViewItem.prototype._update = function () {
        var parent = this.parent;
        var controller = this._iosViewController;
        if (parent && controller) {
            var icon = parent._getIcon(this.iconSource);
            var index_1 = parent.items.indexOf(this);
            var title = text_base_1.getTransformedText(this.title, this.style.textTransform);
            var tabBarItem = UITabBarItem.alloc().initWithTitleImageTag(title, icon, index_1);
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            }
            else if (!title) {
                updateItemIconPosition(tabBarItem);
            }
            var states = getTitleAttributesForStates(parent);
            applyStatesToItem(tabBarItem, states);
            controller.tabBarItem = tabBarItem;
        }
    };
    TabViewItem.prototype[text_base_1.textTransformProperty.setNative] = function (value) {
        this._update();
    };
    return TabViewItem;
}(tab_view_common_1.TabViewItemBase));
exports.TabViewItem = TabViewItem;
var TabView = (function (_super) {
    __extends(TabView, _super);
    function TabView() {
        var _this = _super.call(this) || this;
        _this._tabBarHeight = 0;
        _this._navBarHeight = 0;
        _this._iconsCache = {};
        _this._ios = UITabBarControllerImpl.initWithOwner(new WeakRef(_this));
        _this.nativeViewProtected = _this._ios.view;
        _this._delegate = UITabBarControllerDelegateImpl.initWithOwner(new WeakRef(_this));
        _this._moreNavigationControllerDelegate = UINavigationControllerDelegateImpl.initWithOwner(new WeakRef(_this));
        return _this;
    }
    TabView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this._ios.delegate = this._delegate;
    };
    TabView.prototype.onUnloaded = function () {
        this._ios.delegate = null;
        this._ios.moreNavigationController.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    Object.defineProperty(TabView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    TabView.prototype._onViewControllerShown = function (viewController) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView._onViewControllerShown(" + viewController + ");", tab_view_common_1.traceCategories.Debug);
        }
        if (this._ios.viewControllers && this._ios.viewControllers.containsObject(viewController)) {
            this.selectedIndex = this._ios.viewControllers.indexOfObject(viewController);
        }
        else {
            if (tab_view_common_1.traceEnabled()) {
                tab_view_common_1.traceWrite("TabView._onViewControllerShown: viewController is not one of our viewControllers", tab_view_common_1.traceCategories.Debug);
            }
        }
    };
    TabView.prototype._handleTwoNavigationBars = function (backToMoreWillBeVisible) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView._handleTwoNavigationBars(backToMoreWillBeVisible: " + backToMoreWillBeVisible + ")", tab_view_common_1.traceCategories.Debug);
        }
        var page = this.page;
        var actionBarVisible = page.frame._getNavBarVisible(page);
        if (backToMoreWillBeVisible && actionBarVisible) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = true;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = true;
            if (tab_view_common_1.traceEnabled()) {
                tab_view_common_1.traceWrite("TabView hid action bar", tab_view_common_1.traceCategories.Debug);
            }
            return;
        }
        if (!backToMoreWillBeVisible && this._actionBarHiddenByTabView) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = false;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = undefined;
            if (tab_view_common_1.traceEnabled()) {
                tab_view_common_1.traceWrite("TabView restored action bar", tab_view_common_1.traceCategories.Debug);
            }
            return;
        }
    };
    TabView.prototype.setViewControllers = function (items) {
        var length = items ? items.length : 0;
        if (length === 0) {
            this._ios.viewControllers = null;
            return;
        }
        var controllers = NSMutableArray.alloc().initWithCapacity(length);
        var states = getTitleAttributesForStates(this);
        for (var i = 0; i < length; i++) {
            var item = items[i];
            var newController = void 0;
            if (item.view.ios instanceof UIViewController) {
                newController = item.view.ios;
            }
            else {
                newController = UIViewController.new();
                newController.view.addSubview(item.view.ios);
            }
            item.setViewController(newController);
            var icon = this._getIcon(item.iconSource);
            var tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((item.title || ""), icon, i);
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            }
            else if (!item.title) {
                updateItemIconPosition(tabBarItem);
            }
            applyStatesToItem(tabBarItem, states);
            newController.tabBarItem = tabBarItem;
            controllers.addObject(newController);
        }
        this._ios.viewControllers = controllers;
        this._ios.customizableViewControllers = null;
        this._ios.moreNavigationController.delegate = this._moreNavigationControllerDelegate;
    };
    TabView.prototype._getIconRenderingMode = function () {
        switch (this.iosIconRenderingMode) {
            case "alwaysOriginal":
                return 1;
            case "alwaysTemplate":
                return 2;
            case "automatic":
            default:
                return 0;
        }
    };
    TabView.prototype._getIcon = function (iconSource) {
        if (!iconSource) {
            return null;
        }
        var image = this._iconsCache[iconSource];
        if (!image) {
            var is = image_source_1.fromFileOrResource(iconSource);
            if (is && is.ios) {
                var originalRenderedImage = is.ios.imageWithRenderingMode(this._getIconRenderingMode());
                this._iconsCache[iconSource] = originalRenderedImage;
                image = originalRenderedImage;
            }
        }
        return image;
    };
    TabView.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var nativeView = this.nativeViewProtected;
        if (nativeView) {
            var width = tab_view_common_1.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = tab_view_common_1.layout.getMeasureSpecMode(widthMeasureSpec);
            var height = tab_view_common_1.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = tab_view_common_1.layout.getMeasureSpecMode(heightMeasureSpec);
            this._tabBarHeight = tab_view_common_1.layout.measureNativeView(this._ios.tabBar, width, widthMode, height, heightMode).height;
            var moreNavBarVisible = !!this._ios.moreNavigationController.navigationBar.window;
            this._navBarHeight = moreNavBarVisible ? tab_view_common_1.layout.measureNativeView(this._ios.moreNavigationController.navigationBar, width, widthMode, height, heightMode).height : 0;
            var density = tab_view_common_1.layout.getDisplayDensity();
            var measureWidth = 0;
            var measureHeight = 0;
            var child = this._selectedView;
            if (child) {
                var childHeightMeasureSpec = tab_view_common_1.layout.makeMeasureSpec(height - this._navBarHeight - this._tabBarHeight, heightMode);
                var childSize = tab_view_common_1.View.measureChild(this, child, widthMeasureSpec, childHeightMeasureSpec);
                measureHeight = childSize.measuredHeight;
                measureWidth = childSize.measuredWidth;
            }
            measureWidth = Math.max(measureWidth, this.effectiveMinWidth * density);
            measureHeight = Math.max(measureHeight, this.effectiveMinHeight * density);
            var widthAndState = tab_view_common_1.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = tab_view_common_1.View.resolveSizeAndState(measureHeight, height, heightMode, 0);
            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    };
    TabView.prototype.onLayout = function (left, top, right, bottom) {
        _super.prototype.onLayout.call(this, left, top, right, bottom);
        var child = this._selectedView;
        if (child) {
            tab_view_common_1.View.layoutChild(this, child, 0, this._navBarHeight, right, (bottom - this._navBarHeight - this._tabBarHeight));
        }
    };
    TabView.prototype._updateIOSTabBarColorsAndFonts = function () {
        if (!this.items) {
            return;
        }
        var tabBar = this.ios.tabBar;
        var states = getTitleAttributesForStates(this);
        for (var i = 0; i < tabBar.items.count; i++) {
            applyStatesToItem(tabBar.items[i], states);
        }
    };
    TabView.prototype[tab_view_common_1.selectedIndexProperty.getDefault] = function () {
        return -1;
    };
    TabView.prototype[tab_view_common_1.selectedIndexProperty.setNative] = function (value) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + value + ")", tab_view_common_1.traceCategories.Debug);
        }
        if (value > -1) {
            this._ios.selectedIndex = value;
        }
    };
    TabView.prototype[tab_view_common_1.itemsProperty.getDefault] = function () {
        return null;
    };
    TabView.prototype[tab_view_common_1.itemsProperty.setNative] = function (value) {
        this.setViewControllers(value);
        tab_view_common_1.selectedIndexProperty.coerce(this);
    };
    TabView.prototype[tab_view_common_1.tabTextColorProperty.getDefault] = function () {
        return null;
    };
    TabView.prototype[tab_view_common_1.tabTextColorProperty.setNative] = function (value) {
        this._updateIOSTabBarColorsAndFonts();
    };
    TabView.prototype[tab_view_common_1.tabBackgroundColorProperty.getDefault] = function () {
        return this._ios.tabBar.barTintColor;
    };
    TabView.prototype[tab_view_common_1.tabBackgroundColorProperty.setNative] = function (value) {
        this._ios.tabBar.barTintColor = value instanceof tab_view_common_1.Color ? value.ios : value;
    };
    TabView.prototype[tab_view_common_1.selectedTabTextColorProperty.getDefault] = function () {
        return this._ios.tabBar.tintColor;
    };
    TabView.prototype[tab_view_common_1.selectedTabTextColorProperty.setNative] = function (value) {
        this._ios.tabBar.tintColor = value instanceof tab_view_common_1.Color ? value.ios : value;
        this._updateIOSTabBarColorsAndFonts();
    };
    TabView.prototype[tab_view_common_1.fontInternalProperty.getDefault] = function () {
        return null;
    };
    TabView.prototype[tab_view_common_1.fontInternalProperty.setNative] = function (value) {
        this._updateIOSTabBarColorsAndFonts();
    };
    TabView.prototype[tab_view_common_1.iosIconRenderingModeProperty.getDefault] = function () {
        return "automatic";
    };
    TabView.prototype[tab_view_common_1.iosIconRenderingModeProperty.setNative] = function (value) {
        this._iconsCache = {};
        var items = this.items;
        if (items && items.length) {
            for (var i = 0, length_1 = items.length; i < length_1; i++) {
                var item = items[i];
                if (item.iconSource) {
                    item._update();
                }
            }
        }
    };
    __decorate([
        profiling_1.profile
    ], TabView.prototype, "onLoaded", null);
    return TabView;
}(tab_view_common_1.TabViewBase));
exports.TabView = TabView;
function getTitleAttributesForStates(tabView) {
    var result = {};
    var font = tabView.style.fontInternal.getUIFont(UIFont.systemFontOfSize(10));
    var tabItemTextColor = tabView.style.tabTextColor;
    var textColor = tabItemTextColor instanceof tab_view_common_1.Color ? tabItemTextColor.ios : null;
    result.normalState = (_a = {}, _a[NSFontAttributeName] = font, _a);
    if (textColor) {
        result.normalState[UITextAttributeTextColor] = textColor;
    }
    var tabSelectedItemTextColor = tabView.style.selectedTabTextColor;
    var selectedTextColor = tabItemTextColor instanceof tab_view_common_1.Color ? tabSelectedItemTextColor.ios : null;
    result.selectedState = (_b = {}, _b[NSFontAttributeName] = font, _b);
    if (selectedTextColor) {
        result.selectedState[UITextAttributeTextColor] = selectedTextColor;
    }
    return result;
    var _a, _b;
}
function applyStatesToItem(item, states) {
    item.setTitleTextAttributesForState(states.normalState, 0);
    item.setTitleTextAttributesForState(states.selectedState, 4);
}
//# sourceMappingURL=tab-view.js.map