function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var page_common_1 = require("./page-common");
var application_1 = require("../../application");
var platform_1 = require("../../platform");
var uiUtils = require("tns-core-modules/ui/utils");
var profiling_1 = require("../../profiling");
__export(require("./page-common"));
var utils_1 = require("../../utils/utils");
var getter = utils_1.ios.getter;
var ENTRY = "_entry";
var DELEGATE = "_delegate";
function isBackNavigationTo(page, entry) {
    var frame = page.frame;
    if (!frame) {
        return false;
    }
    if (frame.navigationQueueIsEmpty()) {
        return true;
    }
    else {
        var navigationQueue = frame._navigationQueue;
        for (var i = 0; i < navigationQueue.length; i++) {
            if (navigationQueue[i].entry === entry) {
                return navigationQueue[i].isBackNavigation;
            }
        }
    }
    return false;
}
function isBackNavigationFrom(controller, page) {
    if (!page.frame) {
        return false;
    }
    if (controller.isBackstackCleared || controller.isBackstackSkipped) {
        return false;
    }
    if (controller.navigationController && controller.navigationController.viewControllers.containsObject(controller)) {
        return false;
    }
    return true;
}
var UIViewControllerImpl = (function (_super) {
    __extends(UIViewControllerImpl, _super);
    function UIViewControllerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UIViewControllerImpl.initWithOwner = function (owner) {
        var controller = UIViewControllerImpl.new();
        controller._owner = owner;
        controller.automaticallyAdjustsScrollViewInsets = false;
        controller.shown = false;
        return controller;
    };
    UIViewControllerImpl.prototype.viewDidLayoutSubviews = function () {
        var owner = this._owner.get();
        if (!owner) {
            return;
        }
        if (page_common_1.traceEnabled()) {
            page_common_1.traceWrite(owner + " viewDidLayoutSubviews, isLoaded = " + owner.isLoaded, page_common_1.traceCategories.ViewHierarchy);
        }
        if (!owner.isLoaded) {
            return;
        }
        var modalParent = owner._modalParent;
        if (modalParent) {
            var isFullScreen = !owner._UIModalPresentationFormSheet ||
                (modalParent.nativeViewProtected.traitCollection.horizontalSizeClass === 1);
            var frame = isFullScreen ? getter(UIScreen, UIScreen.mainScreen).bounds : this.view.frame;
            var size = frame.size;
            var width = page_common_1.layout.toDevicePixels(size.width);
            var height = page_common_1.layout.toDevicePixels(size.height);
            var mode = page_common_1.layout.EXACTLY;
            var superViewRotationRadians = void 0;
            if (this.view.superview) {
                var transform = this.view.superview.transform;
                superViewRotationRadians = atan2f(transform.b, transform.a);
            }
            var bottom = height;
            var statusBarHeight = uiUtils.ios.getStatusBarHeight();
            var statusBarVisible = !getter(UIApplication, UIApplication.sharedApplication).statusBarHidden;
            var backgroundSpanUnderStatusBar = owner.backgroundSpanUnderStatusBar;
            if (statusBarVisible && !backgroundSpanUnderStatusBar) {
                height -= statusBarHeight;
            }
            var widthSpec = page_common_1.layout.makeMeasureSpec(width, mode);
            var heightSpec = page_common_1.layout.makeMeasureSpec(height, mode);
            page_common_1.View.measureChild(modalParent, owner, widthSpec, heightSpec);
            var top_1 = ((backgroundSpanUnderStatusBar && isFullScreen) || !isFullScreen) ? 0 : statusBarHeight;
            page_common_1.View.layoutChild(modalParent, owner, 0, top_1, width, bottom);
            if (page_common_1.traceEnabled()) {
                page_common_1.traceWrite(owner + ", native frame = " + NSStringFromCGRect(this.view.frame), page_common_1.traceCategories.Layout);
            }
        }
        else {
            if (!application_1.ios.window) {
                uiUtils.ios._layoutRootView(owner, getter(UIScreen, UIScreen.mainScreen).bounds);
            }
            owner._updateLayout();
        }
    };
    UIViewControllerImpl.prototype.viewWillAppear = function (animated) {
        _super.prototype.viewWillAppear.call(this, animated);
        this.shown = false;
        var page = this._owner.get();
        if (page_common_1.traceEnabled) {
            page_common_1.traceWrite(page + " viewWillAppear", page_common_1.traceCategories.Navigation);
        }
        if (!page) {
            return;
        }
        var frame = this.navigationController ? this.navigationController.owner : null;
        var newEntry = this[ENTRY];
        var modalParent = page._modalParent;
        if (!page._presentedViewController && newEntry && (!frame || frame.currentPage !== page)) {
            var isBack = isBackNavigationTo(page, newEntry);
            page.onNavigatingTo(newEntry.entry.context, isBack, newEntry.entry.bindingContext);
        }
        page._enableLoadedEvents = true;
        if (modalParent) {
            modalParent.frame._addView(page);
        }
        if (frame) {
            if (!page.parent) {
                if (!frame._currentEntry) {
                    frame._currentEntry = newEntry;
                }
                else {
                    frame._navigateToEntry = newEntry;
                }
                frame._addView(page);
                frame.remeasureFrame();
            }
            else if (page.parent !== frame) {
                throw new Error("Page is already shown on another frame.");
            }
            page.actionBar.update();
        }
        page._viewWillDisappear = false;
        if (!page.isLoaded) {
            page.onLoaded();
        }
        page._enableLoadedEvents = false;
    };
    UIViewControllerImpl.prototype.viewDidAppear = function (animated) {
        _super.prototype.viewDidAppear.call(this, animated);
        this.shown = true;
        var page = this._owner.get();
        if (page_common_1.traceEnabled()) {
            page_common_1.traceWrite(page + " viewDidAppear", page_common_1.traceCategories.Navigation);
        }
        if (!page) {
            return;
        }
        page._viewWillDisappear = false;
        var frame = this.navigationController ? this.navigationController.owner : null;
        if (!page._presentedViewController && frame) {
            var newEntry = this[ENTRY];
            var isBack = isBackNavigationTo(page, newEntry);
            if (frame.currentPage === page && frame._navigationQueue.length === 0) {
                isBack = false;
            }
            frame._navigateToEntry = null;
            frame._currentEntry = newEntry;
            frame.remeasureFrame();
            frame._updateActionBar(page);
            page.onNavigatedTo(isBack);
            frame.ios.controller.delegate = this[DELEGATE];
            if (frame.canGoBack()) {
                this.navigationController.interactivePopGestureRecognizer.delegate = this.navigationController;
                this.navigationController.interactivePopGestureRecognizer.enabled = page.enableSwipeBackNavigation;
            }
            else {
                this.navigationController.interactivePopGestureRecognizer.enabled = false;
            }
            frame._processNavigationQueue(page);
        }
        if (!this.presentedViewController) {
            page._presentedViewController = null;
        }
    };
    ;
    UIViewControllerImpl.prototype.viewWillDisappear = function (animated) {
        _super.prototype.viewWillDisappear.call(this, animated);
        var page = this._owner.get();
        if (page_common_1.traceEnabled()) {
            page_common_1.traceWrite(page + " viewWillDisappear", page_common_1.traceCategories.Navigation);
        }
        if (!page) {
            return;
        }
        if (!page._presentedViewController) {
            page._presentedViewController = this.presentedViewController;
        }
        var frame = page.frame;
        if (!page._presentedViewController && frame && frame.currentPage === page) {
            var isBack = isBackNavigationFrom(this, page);
            page.onNavigatingFrom(isBack);
        }
        page._viewWillDisappear = true;
    };
    UIViewControllerImpl.prototype.viewDidDisappear = function (animated) {
        _super.prototype.viewDidDisappear.call(this, animated);
        var page = this._owner.get();
        if (page_common_1.traceEnabled()) {
            page_common_1.traceWrite(page + " viewDidDisappear", page_common_1.traceCategories.Navigation);
        }
        if (!page || page.modal || page._presentedViewController) {
            return;
        }
        var modalParent = page._modalParent;
        page._modalParent = undefined;
        page._UIModalPresentationFormSheet = false;
        if (modalParent) {
            modalParent.frame._removeView(page);
            modalParent._modal = undefined;
        }
        var frame = page.frame;
        if (!modalParent && frame && frame.backStack.length > 0 && frame.navigationQueueIsEmpty() && frame.currentPage === page) {
            frame._backStack.pop();
        }
        page._enableLoadedEvents = true;
        var isBack = isBackNavigationFrom(this, page);
        if (isBack) {
            frame._removeView(page);
        }
        if (page.isLoaded) {
            page.onUnloaded();
        }
        page._enableLoadedEvents = false;
        if (!modalParent) {
            page.onNavigatedFrom(isBack);
        }
    };
    return UIViewControllerImpl;
}(UIViewController));
var Page = (function (_super) {
    __extends(Page, _super);
    function Page() {
        var _this = _super.call(this) || this;
        _this._ios = UIViewControllerImpl.initWithOwner(new WeakRef(_this));
        _this.nativeViewProtected = _this._ios.view;
        _this.nativeViewProtected.backgroundColor = new page_common_1.Color("white").ios;
        return _this;
    }
    Page.prototype.requestLayout = function () {
        _super.prototype.requestLayout.call(this);
        if ((!this.parent || this._modalParent) && this.ios && this.nativeViewProtected) {
            this.nativeViewProtected.setNeedsLayout();
        }
    };
    Page.prototype._onContentChanged = function (oldView, newView) {
        _super.prototype._onContentChanged.call(this, oldView, newView);
        this._removeNativeView(oldView);
        this._addNativeView(newView);
    };
    Page.prototype.onLoaded = function () {
        if (this._enableLoadedEvents) {
            _super.prototype.onLoaded.call(this);
        }
        this.updateActionBar();
    };
    Page.prototype.onUnloaded = function () {
        if (this._enableLoadedEvents) {
            _super.prototype.onUnloaded.call(this);
        }
    };
    Page.prototype._addNativeView = function (view) {
        if (view) {
            if (page_common_1.traceEnabled()) {
                page_common_1.traceWrite("Native: Adding " + view + " to " + this, page_common_1.traceCategories.ViewHierarchy);
            }
            if (view.ios instanceof UIView) {
                this._ios.view.addSubview(view.ios);
            }
            else if (view.ios instanceof UIViewController) {
                this._ios.addChildViewController(view.ios);
                this._ios.view.addSubview(view.ios.view);
            }
        }
    };
    Page.prototype._removeNativeView = function (view) {
        if (view) {
            if (page_common_1.traceEnabled()) {
                page_common_1.traceWrite("Native: Removing " + view + " from " + this, page_common_1.traceCategories.ViewHierarchy);
            }
            if (view.ios instanceof UIView) {
                view.ios.removeFromSuperview();
            }
            else if (view.ios instanceof UIViewController) {
                view.ios.removeFromParentViewController();
                view.ios.view.removeFromSuperview();
            }
        }
    };
    Object.defineProperty(Page.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    Page.prototype._showNativeModalView = function (parent, context, closeCallback, fullscreen) {
        var _this = this;
        _super.prototype._showNativeModalView.call(this, parent, context, closeCallback, fullscreen);
        this._modalParent = parent;
        if (!parent.ios.view.window) {
            throw new Error("Parent page is not part of the window hierarchy. Close the current modal page before showing another one!");
        }
        if (fullscreen) {
            this._ios.modalPresentationStyle = 0;
        }
        else {
            this._ios.modalPresentationStyle = 2;
            this._UIModalPresentationFormSheet = true;
        }
        _super.prototype._raiseShowingModallyEvent.call(this);
        parent.ios.presentViewControllerAnimatedCompletion(this._ios, true, null);
        var transitionCoordinator = getter(parent.ios, parent.ios.transitionCoordinator);
        if (transitionCoordinator) {
            UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion.call(transitionCoordinator, null, function () { return _this._raiseShownModallyEvent(); });
        }
        else {
            this._raiseShownModallyEvent();
        }
    };
    Page.prototype._hideNativeModalView = function (parent) {
        parent.requestLayout();
        parent._ios.dismissModalViewControllerAnimated(true);
        _super.prototype._hideNativeModalView.call(this, parent);
    };
    Page.prototype.updateActionBar = function (disableNavBarAnimation) {
        if (disableNavBarAnimation === void 0) { disableNavBarAnimation = false; }
        var frame = this.frame;
        if (frame) {
            frame._updateActionBar(this, disableNavBarAnimation);
        }
    };
    Page.prototype.updateStatusBar = function () {
        this._updateStatusBarStyle(this.statusBarStyle);
    };
    Page.prototype._updateStatusBarStyle = function (value) {
        var frame = this.frame;
        if (this.frame && value) {
            var navigationController = frame.ios.controller;
            var navigationBar = navigationController.navigationBar;
            navigationBar.barStyle = value === "dark" ? 1 : 0;
        }
    };
    Page.prototype._updateEnableSwipeBackNavigation = function (enabled) {
        var navController = this._ios.navigationController;
        if (this.frame && navController && navController.interactivePopGestureRecognizer) {
            enabled = enabled && this.frame.canGoBack();
            navController.interactivePopGestureRecognizer.enabled = enabled;
        }
    };
    Page.prototype._updateEffectiveLayoutValues = function (parent) {
        _super.prototype._updateEffectiveLayoutValues.call(this, parent);
        if (!this.backgroundSpanUnderStatusBar) {
            var style = this.style;
            var parentHeightMeasureSpec = parent._currentHeightMeasureSpec;
            var parentHeightMeasureSize = page_common_1.layout.getMeasureSpecSize(parentHeightMeasureSpec) - uiUtils.ios.getStatusBarHeight();
            var parentHeightMeasureMode = page_common_1.layout.getMeasureSpecMode(parentHeightMeasureSpec);
            var parentAvailableHeight = parentHeightMeasureMode === page_common_1.layout.UNSPECIFIED ? -1 : parentHeightMeasureSize;
            this.effectiveMarginTop = page_common_1.PercentLength.toDevicePixels(style.marginTop, 0, parentAvailableHeight);
            this.effectiveMarginBottom = page_common_1.PercentLength.toDevicePixels(style.marginBottom, 0, parentAvailableHeight);
        }
    };
    Page.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var width = page_common_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = page_common_1.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = page_common_1.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = page_common_1.layout.getMeasureSpecMode(heightMeasureSpec);
        var actionBarWidth = 0;
        var actionBarHeight = 0;
        var statusBarHeight = this.backgroundSpanUnderStatusBar ? uiUtils.ios.getStatusBarHeight() : 0;
        if (this.frame && this.frame.parent) {
            statusBarHeight = 0;
        }
        if (this._modalParent && this._UIModalPresentationFormSheet && platform_1.device.deviceType === "Tablet") {
            statusBarHeight = 0;
        }
        if (!this._modalParent && this.frame && this.frame._getNavBarVisible(this)) {
            var actionBarSize = page_common_1.View.measureChild(this, this.actionBar, widthMeasureSpec, page_common_1.layout.makeMeasureSpec(height, page_common_1.layout.AT_MOST));
            actionBarWidth = actionBarSize.measuredWidth;
            actionBarHeight = actionBarSize.measuredHeight;
        }
        var heightSpec = page_common_1.layout.makeMeasureSpec(height - actionBarHeight - statusBarHeight, heightMode);
        var result = page_common_1.View.measureChild(this, this.layoutView, widthMeasureSpec, heightSpec);
        var measureWidth = Math.max(actionBarWidth, result.measuredWidth, this.effectiveMinWidth);
        var measureHeight = Math.max(result.measuredHeight + actionBarHeight, this.effectiveMinHeight);
        var widthAndState = page_common_1.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = page_common_1.View.resolveSizeAndState(measureHeight, height, heightMode, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    };
    Page.prototype.onLayout = function (left, top, right, bottom) {
        page_common_1.View.layoutChild(this, this.actionBar, 0, 0, right - left, bottom - top);
        var navigationBarHeight = 0;
        if (this.frame && this.frame._getNavBarVisible(this)) {
            navigationBarHeight = this.actionBar.getMeasuredHeight();
        }
        if (this.frame && this.frame.ios &&
            this.frame.ios.controller.navigationBar &&
            !this.frame.ios.controller.navigationBar.translucent &&
            !this._ios.shown) {
            navigationBarHeight = 0;
        }
        var statusBarHeight = this.backgroundSpanUnderStatusBar ? uiUtils.ios.getStatusBarHeight() : 0;
        if (this.frame && this.frame.parent) {
            statusBarHeight = 0;
        }
        if (this._modalParent && this._UIModalPresentationFormSheet && platform_1.device.deviceType === "Tablet") {
            statusBarHeight = 0;
        }
        page_common_1.View.layoutChild(this, this.layoutView, 0, navigationBarHeight + statusBarHeight, right - left, bottom - top);
    };
    Page.prototype._addViewToNativeVisualTree = function (view) {
        if (view === this.actionBar) {
            return true;
        }
        return _super.prototype._addViewToNativeVisualTree.call(this, view);
    };
    Page.prototype._removeViewFromNativeVisualTree = function (view) {
        if (view === this.actionBar) {
            return;
        }
        _super.prototype._removeViewFromNativeVisualTree.call(this, view);
    };
    Page.prototype[page_common_1.actionBarHiddenProperty.getDefault] = function () {
        return undefined;
    };
    Page.prototype[page_common_1.actionBarHiddenProperty.setNative] = function (value) {
        this._updateEnableSwipeBackNavigation(value);
        if (this.isLoaded) {
            this.updateActionBar(true);
        }
    };
    Page.prototype[page_common_1.statusBarStyleProperty.getDefault] = function () {
        return 0;
    };
    Page.prototype[page_common_1.statusBarStyleProperty.setNative] = function (value) {
        var frame = this.frame;
        if (frame) {
            var navigationBar = frame.ios.controller.navigationBar;
            if (typeof value === "string") {
                navigationBar.barStyle = value === "dark" ? 1 : 0;
            }
            else {
                navigationBar.barStyle = value;
            }
        }
    };
    __decorate([
        profiling_1.profile
    ], Page.prototype, "onLoaded", null);
    return Page;
}(page_common_1.PageBase));
exports.Page = Page;
//# sourceMappingURL=page.ios.js.map