function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var frame_common_1 = require("./frame-common");
var constants_1 = require("../page/constants");
var fragment_transitions_1 = require("./fragment.transitions");
var profiling_1 = require("../../profiling");
__export(require("./frame-common"));
var HIDDEN = "_hidden";
var INTENT_EXTRA = "com.tns.activity";
var FRAMEID = "_frameId";
var CALLBACKS = "_callbacks";
var navDepth = -1;
var fragmentId = -1;
var activityInitialized;
var Frame = (function (_super) {
    __extends(Frame, _super);
    function Frame() {
        var _this = _super.call(this) || this;
        _this._containerViewId = -1;
        _this._isBack = true;
        _this._android = new AndroidFrame(_this);
        return _this;
    }
    Object.defineProperty(Frame, "defaultAnimatedNavigation", {
        get: function () {
            return frame_common_1.FrameBase.defaultAnimatedNavigation;
        },
        set: function (value) {
            frame_common_1.FrameBase.defaultAnimatedNavigation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame, "defaultTransition", {
        get: function () {
            return frame_common_1.FrameBase.defaultTransition;
        },
        set: function (value) {
            frame_common_1.FrameBase.defaultTransition = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame.prototype, "containerViewId", {
        get: function () {
            return this._containerViewId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    Frame.prototype.createFragment = function (backstackEntry, fragmentTag) {
        ensureFragmentClass();
        var newFragment = new fragmentClass();
        var args = new android.os.Bundle();
        args.putInt(FRAMEID, this._android.frameId);
        newFragment.setArguments(args);
        setFragmentCallbacks(newFragment);
        var callbacks = newFragment[CALLBACKS];
        callbacks.frame = this;
        callbacks.entry = backstackEntry;
        backstackEntry.fragmentTag = fragmentTag;
        backstackEntry.navDepth = navDepth;
        return newFragment;
    };
    Frame.prototype.setCurrent = function (entry) {
        this.changeCurrentPage(entry);
        this._currentEntry = entry;
        this._isBack = true;
        this._processNavigationQueue(entry.resolvedPage);
    };
    Frame.prototype.changeCurrentPage = function (entry) {
        var isBack = this._isBack;
        var page = this.currentPage;
        if (page) {
            if (page.frame === this && isBack) {
                this._removeView(page);
            }
            if (page.isLoaded) {
                page.onUnloaded();
            }
            page.onNavigatedFrom(isBack);
        }
        var newPage = entry.resolvedPage;
        newPage._fragmentTag = entry.fragmentTag;
        this._currentEntry = entry;
        newPage.onNavigatedTo(isBack);
    };
    Frame.prototype._navigateCore = function (backstackEntry) {
        _super.prototype._navigateCore.call(this, backstackEntry);
        this._isBack = false;
        var activity = this._android.activity;
        if (!activity) {
            var currentActivity = this._android.currentActivity;
            if (currentActivity) {
                startActivity(currentActivity, this._android.frameId);
            }
            this._delayedNavigationEntry = backstackEntry;
            return;
        }
        var manager = activity.getFragmentManager();
        var currentFragment = this._currentEntry ? manager.findFragmentByTag(this._currentEntry.fragmentTag) : null;
        var clearHistory = backstackEntry.entry.clearHistory;
        if (clearHistory) {
            navDepth = -1;
        }
        navDepth++;
        fragmentId++;
        var newFragmentTag = "fragment" + fragmentId + "[" + navDepth + "]";
        var newFragment = this.createFragment(backstackEntry, newFragmentTag);
        var fragmentTransaction = manager.beginTransaction();
        var animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        var navigationTransition = this._getNavigationTransition(backstackEntry.entry);
        fragment_transitions_1._setAndroidFragmentTransitions(animated, navigationTransition, currentFragment, newFragment, fragmentTransaction, manager);
        if (currentFragment) {
            if (clearHistory) {
                removeFragments(manager, fragmentTransaction);
            }
            else {
                fragmentTransaction.addToBackStack(this._currentEntry.fragmentTag);
            }
            if (animated && !navigationTransition) {
                fragmentTransaction.setTransition(android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
            }
        }
        fragmentTransaction.replace(this.containerViewId, newFragment, newFragmentTag);
        fragmentTransaction.commit();
        if (clearHistory) {
            manager.popBackStackImmediate(null, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }
    };
    Frame.prototype._goBackCore = function (backstackEntry) {
        _super.prototype._goBackCore.call(this, backstackEntry);
        navDepth = backstackEntry.navDepth;
        var manager = this._android.activity.getFragmentManager();
        if (manager.getBackStackEntryCount() > 0) {
            var fragmentInBackstack = manager.findFragmentByTag(backstackEntry.fragmentTag);
            var currentFragment = manager.findFragmentByTag(this._currentEntry.fragmentTag);
            fragment_transitions_1._waitForAnimationEnd(fragmentInBackstack, currentFragment);
            manager.popBackStack(backstackEntry.fragmentTag, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }
    };
    Frame.prototype.createNativeView = function () {
        var root = new org.nativescript.widgets.ContentLayout(this._context);
        if (this._containerViewId < 0) {
            this._containerViewId = android.view.View.generateViewId();
        }
        return root;
    };
    Frame.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        this._android.rootViewGroup = this.nativeViewProtected;
        this._android.rootViewGroup.setId(this._containerViewId);
    };
    Frame.prototype.disposeNativeView = function () {
        this._android.rootViewGroup = null;
        _super.prototype.disposeNativeView.call(this);
    };
    Frame.prototype._popFromFrameStack = function () {
        if (!this._isInFrameStack) {
            return;
        }
        _super.prototype._popFromFrameStack.call(this);
        if (this._android.hasOwnActivity) {
            this._android.activity.finish();
        }
    };
    Frame.prototype._printNativeBackStack = function () {
        if (!this._android.activity) {
            return;
        }
        var manager = this._android.activity.getFragmentManager();
        var length = manager.getBackStackEntryCount();
        var i = length - 1;
        console.log("Fragment Manager Back Stack: ");
        while (i >= 0) {
            var fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
            console.log("\t" + fragment);
        }
    };
    Frame.prototype._getNavBarVisible = function (page) {
        if (page.actionBarHidden !== undefined) {
            return !page.actionBarHidden;
        }
        if (this._android && this._android.showActionBar !== undefined) {
            return this._android.showActionBar;
        }
        return true;
    };
    Frame.prototype._processNavigationContext = function (navigationContext) {
        var _this = this;
        var activity = this._android.activity;
        if (activity) {
            var isForegroundActivity = activity === frame_common_1.application.android.foregroundActivity;
            var isPaused = frame_common_1.application.android.paused;
            if (activity && !isForegroundActivity || (isForegroundActivity && isPaused)) {
                var weakActivity_1 = new WeakRef(activity);
                var resume_1 = function (args) {
                    var weakActivityInstance = weakActivity_1.get();
                    var isCurrent = args.activity === weakActivityInstance;
                    if (!weakActivityInstance) {
                        if (frame_common_1.traceEnabled()) {
                            frame_common_1.traceWrite("Frame _processNavigationContext: Drop For Activity GC-ed", frame_common_1.traceCategories.Navigation);
                        }
                        unsubscribe_1();
                        return;
                    }
                    if (isCurrent) {
                        if (frame_common_1.traceEnabled()) {
                            frame_common_1.traceWrite("Frame _processNavigationContext: Activity.Resumed, Continue", frame_common_1.traceCategories.Navigation);
                        }
                        _super.prototype._processNavigationContext.call(_this, navigationContext);
                        unsubscribe_1();
                    }
                };
                var unsubscribe_1 = function () {
                    if (frame_common_1.traceEnabled()) {
                        frame_common_1.traceWrite("Frame _processNavigationContext: Unsubscribe from Activity.Resumed", frame_common_1.traceCategories.Navigation);
                    }
                    frame_common_1.application.android.off(frame_common_1.application.AndroidApplication.activityResumedEvent, resume_1);
                    frame_common_1.application.android.off(frame_common_1.application.AndroidApplication.activityStoppedEvent, unsubscribe_1);
                    frame_common_1.application.android.off(frame_common_1.application.AndroidApplication.activityDestroyedEvent, unsubscribe_1);
                };
                if (frame_common_1.traceEnabled()) {
                    frame_common_1.traceWrite("Frame._processNavigationContext: Subscribe for Activity.Resumed", frame_common_1.traceCategories.Navigation);
                }
                frame_common_1.application.android.on(frame_common_1.application.AndroidApplication.activityResumedEvent, resume_1);
                frame_common_1.application.android.on(frame_common_1.application.AndroidApplication.activityStoppedEvent, unsubscribe_1);
                frame_common_1.application.android.on(frame_common_1.application.AndroidApplication.activityDestroyedEvent, unsubscribe_1);
                return;
            }
        }
        _super.prototype._processNavigationContext.call(this, navigationContext);
    };
    __decorate([
        profiling_1.profile
    ], Frame.prototype, "_navigateCore", null);
    return Frame;
}(frame_common_1.FrameBase));
exports.Frame = Frame;
function removeFragments(manager, ft) {
    if (frame_common_1.traceEnabled()) {
        frame_common_1.traceWrite("CLEAR HISTORY", frame_common_1.traceCategories.Navigation);
    }
    for (var i = manager.getBackStackEntryCount() - 1; i >= 0; i--) {
        var fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i).getName());
        ft.detach(fragment);
        var page = fragment[CALLBACKS].entry.resolvedPage;
        if (page.frame) {
            page.frame._removeView(page);
        }
    }
}
var framesCounter = 0;
var framesCache = new Array();
var AndroidFrame = (function (_super) {
    __extends(AndroidFrame, _super);
    function AndroidFrame(owner) {
        var _this = _super.call(this) || this;
        _this.hasOwnActivity = false;
        _this._showActionBar = true;
        _this.cachePagesOnNavigate = true;
        _this._owner = owner;
        _this.frameId = framesCounter++;
        framesCache.push(new WeakRef(_this));
        return _this;
    }
    Object.defineProperty(AndroidFrame.prototype, "showActionBar", {
        get: function () {
            return this._showActionBar;
        },
        set: function (value) {
            if (this._showActionBar !== value) {
                this._showActionBar = value;
                if (this.owner.currentPage) {
                    this.owner.currentPage.actionBar.update();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "activity", {
        get: function () {
            var activity = this.owner._context;
            if (activity) {
                return activity;
            }
            var currView = this._owner.parent;
            while (currView) {
                if (currView instanceof Frame) {
                    return currView.android.activity;
                }
                currView = currView.parent;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "actionBar", {
        get: function () {
            var activity = this.currentActivity;
            if (!activity) {
                return undefined;
            }
            var bar = activity.getActionBar();
            if (!bar) {
                return undefined;
            }
            return bar;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "currentActivity", {
        get: function () {
            var activity = this.activity;
            if (activity) {
                return activity;
            }
            var frames = frame_common_1.stack();
            for (var length_1 = frames.length, i = length_1 - 1; i >= 0; i--) {
                activity = frames[i].android.activity;
                if (activity) {
                    return activity;
                }
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "owner", {
        get: function () {
            return this._owner;
        },
        enumerable: true,
        configurable: true
    });
    AndroidFrame.prototype.canGoBack = function () {
        if (!this.activity) {
            return false;
        }
        return this.activity.getIntent().getAction() !== android.content.Intent.ACTION_MAIN;
    };
    AndroidFrame.prototype.fragmentForPage = function (page) {
        if (!page) {
            return undefined;
        }
        var tag = page._fragmentTag;
        if (tag) {
            var manager = this.activity.getFragmentManager();
            return manager.findFragmentByTag(tag);
        }
        return undefined;
    };
    return AndroidFrame;
}(frame_common_1.Observable));
function findPageForFragment(fragment, frame) {
    var fragmentTag = fragment.getTag();
    if (frame_common_1.traceEnabled()) {
        frame_common_1.traceWrite("Finding page for " + fragmentTag + ".", frame_common_1.traceCategories.NativeLifecycle);
    }
    if (fragmentTag === constants_1.DIALOG_FRAGMENT_TAG) {
        return;
    }
    var entry = frame._findEntryForTag(fragmentTag);
    var page = entry ? entry.resolvedPage : undefined;
    if (page) {
        var callbacks = fragment[CALLBACKS];
        callbacks.frame = frame;
        callbacks.entry = entry;
        fragment_transitions_1._updateAnimationFragment(fragment);
    }
    else {
        throw new Error("Could not find a page for " + fragmentTag + ".");
    }
}
function startActivity(activity, frameId) {
    var intent = new android.content.Intent(activity, activity.getClass());
    intent.setAction(android.content.Intent.ACTION_DEFAULT);
    intent.putExtra(INTENT_EXTRA, frameId);
    activity.startActivity(intent);
}
function getFrameById(frameId) {
    for (var i = 0; i < framesCache.length; i++) {
        var aliveFrame = framesCache[i].get();
        if (aliveFrame && aliveFrame.frameId === frameId) {
            return aliveFrame.owner;
        }
    }
    return null;
}
function ensureFragmentClass() {
    if (fragmentClass) {
        return;
    }
    require("ui/frame/fragment");
    if (!fragmentClass) {
        throw new Error("Failed to initialize the extended android.app.Fragment class");
    }
}
var fragmentClass;
function setFragmentClass(clazz) {
    if (fragmentClass) {
        throw new Error("Fragment class already initialized");
    }
    fragmentClass = clazz;
}
exports.setFragmentClass = setFragmentClass;
var FragmentCallbacksImplementation = (function () {
    function FragmentCallbacksImplementation() {
    }
    FragmentCallbacksImplementation.prototype.onHiddenChanged = function (fragment, hidden, superFunc) {
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite(fragment + ".onHiddenChanged(" + hidden + ")", frame_common_1.traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, hidden);
    };
    FragmentCallbacksImplementation.prototype.onCreateAnimator = function (fragment, transit, enter, nextAnim, superFunc) {
        var nextAnimString;
        switch (nextAnim) {
            case -10:
                nextAnimString = "enter";
                break;
            case -20:
                nextAnimString = "exit";
                break;
            case -30:
                nextAnimString = "popEnter";
                break;
            case -40:
                nextAnimString = "popExit";
                break;
        }
        var animator = fragment_transitions_1._onFragmentCreateAnimator(fragment, nextAnim);
        if (!animator) {
            animator = superFunc.call(fragment, transit, enter, nextAnim);
        }
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite(fragment + ".onCreateAnimator(" + transit + ", " + (enter ? "enter" : "exit") + ", " + nextAnimString + "): " + (animator ? 'animator' : 'no animator'), frame_common_1.traceCategories.NativeLifecycle);
        }
        return animator;
    };
    FragmentCallbacksImplementation.prototype.onCreate = function (fragment, savedInstanceState, superFunc) {
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite(fragment + ".onCreate(" + savedInstanceState + ")", frame_common_1.traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, savedInstanceState);
        if (!this.entry) {
            var frameId = fragment.getArguments().getInt(FRAMEID);
            var frame = getFrameById(frameId);
            if (!frame) {
                throw new Error("Cannot find Frame for " + fragment);
            }
            findPageForFragment(fragment, frame);
        }
    };
    FragmentCallbacksImplementation.prototype.onCreateView = function (fragment, inflater, container, savedInstanceState, superFunc) {
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite(fragment + ".onCreateView(inflater, container, " + savedInstanceState + ")", frame_common_1.traceCategories.NativeLifecycle);
        }
        var entry = this.entry;
        var page = entry.resolvedPage;
        try {
            if (savedInstanceState && savedInstanceState.getBoolean(HIDDEN, false)) {
                fragment.getFragmentManager().beginTransaction().hide(fragment).commit();
            }
            var frame = this.frame;
            if (page.parent === frame) {
                if (frame.isLoaded && !page.isLoaded) {
                    page.onLoaded();
                }
            }
            else {
                this.frame._addView(page);
            }
        }
        catch (ex) {
            var label = new android.widget.TextView(container.getContext());
            label.setText(ex.message + ", " + ex.stackTrace);
            return label;
        }
        return page.nativeViewProtected;
    };
    FragmentCallbacksImplementation.prototype.onSaveInstanceState = function (fragment, outState, superFunc) {
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite(fragment + ".onSaveInstanceState(" + outState + ")", frame_common_1.traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, outState);
        if (fragment.isHidden()) {
            outState.putBoolean(HIDDEN, true);
        }
    };
    FragmentCallbacksImplementation.prototype.onDestroyView = function (fragment, superFunc) {
        var entry = this.entry;
        var page = entry.resolvedPage;
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite(fragment + ".onDestroyView()", frame_common_1.traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment);
    };
    FragmentCallbacksImplementation.prototype.onDestroy = function (fragment, superFunc) {
        var entry = this.entry;
        var page = entry.resolvedPage;
        superFunc.call(fragment);
        var frame = page.frame;
        if (frame && !frame.isCurrent(entry)) {
            frame._removeView(page);
        }
    };
    FragmentCallbacksImplementation.prototype.toStringOverride = function (fragment, superFunc) {
        return fragment.getTag() + "<" + (this.entry ? this.entry.resolvedPage : "") + ">";
    };
    __decorate([
        profiling_1.profile
    ], FragmentCallbacksImplementation.prototype, "onHiddenChanged", null);
    __decorate([
        profiling_1.profile
    ], FragmentCallbacksImplementation.prototype, "onCreateAnimator", null);
    __decorate([
        profiling_1.profile
    ], FragmentCallbacksImplementation.prototype, "onCreate", null);
    __decorate([
        profiling_1.profile
    ], FragmentCallbacksImplementation.prototype, "onCreateView", null);
    __decorate([
        profiling_1.profile
    ], FragmentCallbacksImplementation.prototype, "onSaveInstanceState", null);
    __decorate([
        profiling_1.profile
    ], FragmentCallbacksImplementation.prototype, "onDestroyView", null);
    __decorate([
        profiling_1.profile
    ], FragmentCallbacksImplementation.prototype, "onDestroy", null);
    __decorate([
        profiling_1.profile
    ], FragmentCallbacksImplementation.prototype, "toStringOverride", null);
    return FragmentCallbacksImplementation;
}());
var ActivityCallbacksImplementation = (function () {
    function ActivityCallbacksImplementation() {
    }
    ActivityCallbacksImplementation.prototype.onCreate = function (activity, savedInstanceState, superFunc) {
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite("Activity.onCreate(" + savedInstanceState + ")", frame_common_1.traceCategories.NativeLifecycle);
        }
        var app = frame_common_1.application.android;
        var intent = activity.getIntent();
        var rootView = this.notifyLaunch(intent, savedInstanceState);
        var frameId = -1;
        var extras = intent.getExtras();
        if (extras) {
            frameId = extras.getInt(INTENT_EXTRA, -1);
        }
        if (savedInstanceState && frameId < 0) {
            frameId = savedInstanceState.getInt(INTENT_EXTRA, -1);
        }
        var frame;
        var navParam;
        if (frameId >= 0) {
            rootView = getFrameById(frameId);
        }
        if (!rootView) {
            navParam = frame_common_1.application.getMainEntry();
            if (navParam) {
                frame = new Frame();
            }
            else {
                throw new Error("A Frame must be used to navigate to a Page.");
            }
            rootView = frame;
        }
        var isRestart = !!savedInstanceState && activityInitialized;
        superFunc.call(activity, isRestart ? savedInstanceState : null);
        this._rootView = rootView;
        rootView._setupAsRootView(activity);
        activity.setContentView(rootView.nativeViewProtected, new org.nativescript.widgets.CommonLayoutParams());
        if (frame) {
            frame.navigate(navParam);
        }
        activityInitialized = true;
    };
    ActivityCallbacksImplementation.prototype.notifyLaunch = function (intent, savedInstanceState) {
        var launchArgs = { eventName: frame_common_1.application.launchEvent, object: frame_common_1.application.android, android: intent, savedInstanceState: savedInstanceState };
        frame_common_1.application.notify(launchArgs);
        return launchArgs.root;
    };
    ActivityCallbacksImplementation.prototype.onSaveInstanceState = function (activity, outState, superFunc) {
        superFunc.call(activity, outState);
        var view = this._rootView;
        if (view instanceof Frame) {
            outState.putInt(INTENT_EXTRA, view.android.frameId);
        }
    };
    ActivityCallbacksImplementation.prototype.onStart = function (activity, superFunc) {
        superFunc.call(activity);
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite("NativeScriptActivity.onStart();", frame_common_1.traceCategories.NativeLifecycle);
        }
        var rootView = this._rootView;
        if (rootView && !rootView.isLoaded) {
            rootView.onLoaded();
        }
    };
    ActivityCallbacksImplementation.prototype.onStop = function (activity, superFunc) {
        superFunc.call(activity);
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite("NativeScriptActivity.onStop();", frame_common_1.traceCategories.NativeLifecycle);
        }
        var rootView = this._rootView;
        if (rootView && rootView.isLoaded) {
            rootView.onUnloaded();
        }
    };
    ActivityCallbacksImplementation.prototype.onDestroy = function (activity, superFunc) {
        var rootView = this._rootView;
        if (rootView && rootView._context) {
            rootView._tearDownUI(true);
        }
        superFunc.call(activity);
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite("NativeScriptActivity.onDestroy();", frame_common_1.traceCategories.NativeLifecycle);
        }
        var exitArgs = { eventName: frame_common_1.application.exitEvent, object: frame_common_1.application.android, android: activity };
        frame_common_1.application.notify(exitArgs);
    };
    ActivityCallbacksImplementation.prototype.onBackPressed = function (activity, superFunc) {
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite("NativeScriptActivity.onBackPressed;", frame_common_1.traceCategories.NativeLifecycle);
        }
        var args = {
            eventName: "activityBackPressed",
            object: frame_common_1.application.android,
            activity: activity,
            cancel: false,
        };
        frame_common_1.application.android.notify(args);
        if (args.cancel) {
            return;
        }
        if (!frame_common_1.goBack()) {
            superFunc.call(activity);
        }
    };
    ActivityCallbacksImplementation.prototype.onRequestPermissionsResult = function (activity, requestCode, permissions, grantResults, superFunc) {
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite("NativeScriptActivity.onRequestPermissionsResult;", frame_common_1.traceCategories.NativeLifecycle);
        }
        frame_common_1.application.android.notify({
            eventName: "activityRequestPermissions",
            object: frame_common_1.application.android,
            activity: activity,
            requestCode: requestCode,
            permissions: permissions,
            grantResults: grantResults
        });
    };
    ActivityCallbacksImplementation.prototype.onActivityResult = function (activity, requestCode, resultCode, data, superFunc) {
        superFunc.call(activity, requestCode, resultCode, data);
        if (frame_common_1.traceEnabled()) {
            frame_common_1.traceWrite("NativeScriptActivity.onActivityResult(" + requestCode + ", " + resultCode + ", " + data + ")", frame_common_1.traceCategories.NativeLifecycle);
        }
        frame_common_1.application.android.notify({
            eventName: "activityResult",
            object: frame_common_1.application.android,
            activity: activity,
            requestCode: requestCode,
            resultCode: resultCode,
            intent: data
        });
    };
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "onCreate", null);
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "notifyLaunch", null);
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "onSaveInstanceState", null);
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "onStart", null);
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "onStop", null);
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "onDestroy", null);
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "onBackPressed", null);
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "onRequestPermissionsResult", null);
    __decorate([
        profiling_1.profile
    ], ActivityCallbacksImplementation.prototype, "onActivityResult", null);
    return ActivityCallbacksImplementation;
}());
function setActivityCallbacks(activity) {
    activity[CALLBACKS] = new ActivityCallbacksImplementation();
}
exports.setActivityCallbacks = setActivityCallbacks;
function setFragmentCallbacks(fragment) {
    fragment[CALLBACKS] = new FragmentCallbacksImplementation();
}
exports.setFragmentCallbacks = setFragmentCallbacks;
//# sourceMappingURL=frame.android.js.map