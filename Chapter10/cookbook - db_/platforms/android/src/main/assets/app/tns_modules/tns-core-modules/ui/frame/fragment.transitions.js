Object.defineProperty(exports, "__esModule", { value: true });
var transition_1 = require("../transition/transition");
var slide_transition_1 = require("../transition/slide-transition");
var fade_transition_1 = require("../transition/fade-transition");
var flip_transition_1 = require("../transition/flip-transition");
var animation_1 = require("../animation");
var platform_1 = require("../../platform");
var lazy_1 = require("../../utils/lazy");
var trace_1 = require("../../trace");
var CALLBACKS = "_callbacks";
var sdkVersion = lazy_1.default(function () { return parseInt(platform_1.device.sdkVersion); });
var intEvaluator = lazy_1.default(function () { return new android.animation.IntEvaluator(); });
var defaultInterpolator = lazy_1.default(function () { return new android.view.animation.AccelerateDecelerateInterpolator(); });
var enterFakeResourceId = -10;
var exitFakeResourceId = -20;
var popEnterFakeResourceId = -30;
var popExitFakeResourceId = -40;
var waitingQueue = new Set();
var TransitionListener;
var AnimationListener;
var loadAnimatorMethod;
var reflectionDone;
var defaultEnterAnimatorStatic;
var defaultExitAnimatorStatic;
var fragmentCompleted;
function getFragmentCallbacks(fragment) {
    return fragment[CALLBACKS];
}
function _updateAnimationFragment(newFragment) {
    var callbacks = getFragmentCallbacks(newFragment);
    var entry = callbacks.entry;
    var animator = entry.enterAnimator || entry.exitAnimator || entry.popEnterAnimator || entry.popExitAnimator;
    var transitionListener = entry.enterTransitionListener || entry.exitTransitionListener || entry.reenterTransitionListener || entry.returnTransitionListener;
    var oldFragmentOwner = animator || transitionListener;
    var oldFragment = oldFragmentOwner ? oldFragmentOwner.fragment : null;
    updateAnimatorTarget(entry.enterAnimator, newFragment);
    updateAnimatorTarget(entry.exitAnimator, newFragment);
    updateAnimatorTarget(entry.popEnterAnimator, newFragment);
    updateAnimatorTarget(entry.popExitAnimator, newFragment);
    clearAllTransitions(oldFragment);
    var enterTransitionListener = entry.enterTransitionListener;
    if (enterTransitionListener) {
        enterTransitionListener.fragment = newFragment;
        newFragment.setEnterTransition(enterTransitionListener.enterTransition);
    }
    var exitTransitionListener = entry.exitTransitionListener;
    if (exitTransitionListener) {
        exitTransitionListener.fragment = newFragment;
        newFragment.setExitTransition(exitTransitionListener.exitTransition);
    }
    var reenterTransitionListener = entry.reenterTransitionListener;
    if (reenterTransitionListener) {
        reenterTransitionListener.fragment = newFragment;
        newFragment.setReenterTransition(reenterTransitionListener.reenterTransition);
    }
    var returnTransitionListener = entry.returnTransitionListener;
    if (returnTransitionListener) {
        returnTransitionListener.fragment = newFragment;
        newFragment.setReturnTransition(returnTransitionListener.returnTransition);
    }
}
exports._updateAnimationFragment = _updateAnimationFragment;
function updateAnimatorTarget(animator, fragment) {
    if (animator) {
        animator.fragment = fragment;
    }
}
function _waitForAnimationEnd(newFragment, currentFragment) {
    if (waitingQueue.size > 0) {
        throw new Error('Calling navigation before previous queue completes.');
    }
    if (newFragment) {
        waitingQueue.add(newFragment);
    }
    if (currentFragment) {
        waitingQueue.add(currentFragment);
    }
    if (waitingQueue.size === 0) {
        throw new Error('At least one fragment should be specified.');
    }
}
exports._waitForAnimationEnd = _waitForAnimationEnd;
function _setAndroidFragmentTransitions(animated, navigationTransition, currentFragment, newFragment, fragmentTransaction, manager) {
    _waitForAnimationEnd(newFragment, currentFragment);
    if (sdkVersion() >= 21) {
        allowTransitionOverlap(currentFragment);
        allowTransitionOverlap(newFragment);
    }
    var name = '';
    var transition;
    if (navigationTransition) {
        transition = navigationTransition.instance;
        name = navigationTransition.name ? navigationTransition.name.toLowerCase() : '';
    }
    var useLollipopTransition = name && (name.indexOf('slide') === 0 || name === 'fade' || name === 'explode') && sdkVersion() >= 21;
    if (!animated) {
        name = 'none';
    }
    else if (transition) {
        name = 'custom';
        useLollipopTransition = false;
    }
    else if (!useLollipopTransition && name.indexOf('slide') !== 0 && name !== 'fade' && name.indexOf('flip') !== 0) {
        name = 'default';
    }
    var callbacks = getFragmentCallbacks(newFragment);
    var newEntry = callbacks.entry;
    var currentEntry = currentFragment ? getFragmentCallbacks(currentFragment).entry : null;
    var currentFragmentNeedsDifferentAnimation = false;
    if (currentEntry &&
        (currentEntry.transitionName !== name || currentEntry.transition !== transition)) {
        clearTransitions(currentFragment, true);
        currentFragmentNeedsDifferentAnimation = true;
    }
    if (name === 'none') {
        transition = new NoTransition(0, null);
    }
    else if (name === 'default') {
        initDefaultAnimations(manager);
        transition = new DefaultTransition(0, null);
    }
    else if (useLollipopTransition) {
        if (name.indexOf('slide') === 0) {
            setupNewFragmentSlideTransition(navigationTransition, newFragment, name);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentSlideTransition(navigationTransition, currentFragment, name);
            }
        }
        else if (name === 'fade') {
            setupNewFragmentFadeTransition(navigationTransition, newFragment);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentFadeTransition(navigationTransition, currentFragment);
            }
        }
        else if (name === 'explode') {
            setupNewFragmentExplodeTransition(navigationTransition, newFragment);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentExplodeTransition(navigationTransition, currentFragment);
            }
        }
    }
    else if (name.indexOf('slide') === 0) {
        var direction = name.substr('slide'.length) || 'left';
        transition = new slide_transition_1.SlideTransition(direction, navigationTransition.duration, navigationTransition.curve);
    }
    else if (name === 'fade') {
        transition = new fade_transition_1.FadeTransition(navigationTransition.duration, navigationTransition.curve);
    }
    else if (name.indexOf('flip') === 0) {
        var direction = name.substr('flip'.length) || 'right';
        transition = new flip_transition_1.FlipTransition(direction, navigationTransition.duration, navigationTransition.curve);
    }
    newEntry.transitionName = name;
    if (name === 'custom') {
        newEntry.transition = transition;
    }
    if (transition) {
        fragmentTransaction.setCustomAnimations(enterFakeResourceId, exitFakeResourceId, popEnterFakeResourceId, popExitFakeResourceId);
        setupAllAnimation(newFragment, transition);
        if (currentFragmentNeedsDifferentAnimation) {
            setupExitAndPopEnterAnimation(currentFragment, transition);
        }
    }
    if (currentEntry) {
        currentEntry.transitionName = name;
        if (name === 'custom') {
            currentEntry.transition = transition;
        }
    }
    printTransitions(currentFragment);
    printTransitions(newFragment);
}
exports._setAndroidFragmentTransitions = _setAndroidFragmentTransitions;
function _onFragmentCreateAnimator(fragment, nextAnim) {
    var entry = getFragmentCallbacks(fragment).entry;
    switch (nextAnim) {
        case enterFakeResourceId:
            return entry.enterAnimator;
        case exitFakeResourceId:
            return entry.exitAnimator;
        case popEnterFakeResourceId:
            return entry.popEnterAnimator;
        case popExitFakeResourceId:
            return entry.popExitAnimator;
    }
    return null;
}
exports._onFragmentCreateAnimator = _onFragmentCreateAnimator;
var NoTransition = (function (_super) {
    __extends(NoTransition, _super);
    function NoTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoTransition.prototype.createAndroidAnimator = function (transitionType) {
        return createDummyZeroDurationAnimator();
    };
    return NoTransition;
}(transition_1.Transition));
var DefaultTransition = (function (_super) {
    __extends(DefaultTransition, _super);
    function DefaultTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultTransition.prototype.createAndroidAnimator = function (transitionType) {
        switch (transitionType) {
            case transition_1.AndroidTransitionType.enter:
            case transition_1.AndroidTransitionType.popEnter:
                return getDefaultAnimation(true);
            case transition_1.AndroidTransitionType.popExit:
            case transition_1.AndroidTransitionType.exit:
                return getDefaultAnimation(false);
        }
    };
    return DefaultTransition;
}(transition_1.Transition));
function getTransitionListener(fragment) {
    if (!TransitionListener) {
        var TransitionListenerImpl = (function (_super) {
            __extends(TransitionListenerImpl, _super);
            function TransitionListenerImpl(fragment) {
                var _this = _super.call(this) || this;
                _this.fragment = fragment;
                return global.__native(_this);
            }
            TransitionListenerImpl.prototype.onTransitionStart = function (transition) {
                if (trace_1.isEnabled()) {
                    trace_1.write("START " + toShortString(transition) + " transition for " + this.fragment, trace_1.categories.Transition);
                }
            };
            TransitionListenerImpl.prototype.onTransitionEnd = function (transition) {
                var expandedFragment = this.fragment;
                if (trace_1.isEnabled()) {
                    trace_1.write("END " + toShortString(transition) + " transition for " + expandedFragment, trace_1.categories.Transition);
                }
                transitionOrAnimationCompleted(expandedFragment);
            };
            TransitionListenerImpl.prototype.onTransitionResume = function (transition) {
                if (trace_1.isEnabled()) {
                    trace_1.write("RESUME " + toShortString(transition) + " transition for " + this.fragment, trace_1.categories.Transition);
                }
            };
            TransitionListenerImpl.prototype.onTransitionPause = function (transition) {
                if (trace_1.isEnabled()) {
                    trace_1.write("PAUSE " + toShortString(transition) + " transition for " + this.fragment, trace_1.categories.Transition);
                }
            };
            TransitionListenerImpl.prototype.onTransitionCancel = function (transition) {
                if (trace_1.isEnabled()) {
                    trace_1.write("CANCEL " + toShortString(transition) + " transition for " + this.fragment, trace_1.categories.Transition);
                }
            };
            TransitionListenerImpl = __decorate([
                Interfaces([android.transition.Transition.TransitionListener])
            ], TransitionListenerImpl);
            return TransitionListenerImpl;
        }(java.lang.Object));
        TransitionListener = TransitionListenerImpl;
    }
    return new TransitionListener(fragment);
}
function getAnimationListener() {
    if (!AnimationListener) {
        var AnimationListnerImpl = (function (_super) {
            __extends(AnimationListnerImpl, _super);
            function AnimationListnerImpl() {
                var _this = _super.call(this) || this;
                return global.__native(_this);
            }
            AnimationListnerImpl.prototype.onAnimationStart = function (animator) {
                if (trace_1.isEnabled()) {
                    trace_1.write("START " + animator.transitionType + " for " + animator.fragment, trace_1.categories.Transition);
                }
            };
            AnimationListnerImpl.prototype.onAnimationRepeat = function (animator) {
                if (trace_1.isEnabled()) {
                    trace_1.write("REPEAT " + animator.transitionType + " for " + animator.fragment, trace_1.categories.Transition);
                }
            };
            AnimationListnerImpl.prototype.onAnimationEnd = function (animator) {
                if (trace_1.isEnabled()) {
                    trace_1.write("END " + animator.transitionType + " for " + animator.fragment, trace_1.categories.Transition);
                }
                transitionOrAnimationCompleted(animator.fragment);
            };
            AnimationListnerImpl.prototype.onAnimationCancel = function (animator) {
                if (trace_1.isEnabled()) {
                    trace_1.write("CANCEL " + animator.transitionType + " for " + animator.fragment, trace_1.categories.Transition);
                }
            };
            AnimationListnerImpl = __decorate([
                Interfaces([android.animation.Animator.AnimatorListener])
            ], AnimationListnerImpl);
            return AnimationListnerImpl;
        }(java.lang.Object));
        AnimationListener = new AnimationListnerImpl();
    }
    return AnimationListener;
}
function clearAnimationListener(animator, listener) {
    if (!animator) {
        return;
    }
    animator.removeListener(listener);
    var fragment = animator.fragment;
    if (!fragment) {
        return;
    }
    animator.fragment = null;
    var entry = getFragmentCallbacks(fragment).entry;
    if (trace_1.isEnabled()) {
        trace_1.write("Clear " + animator.transitionType + " - " + entry.transition + " for " + fragment, trace_1.categories.Transition);
    }
}
function clearTransitions(fragment, removeListener) {
    if (sdkVersion() >= 21) {
        var entry = getFragmentCallbacks(fragment).entry;
        var exitListener = entry.exitTransitionListener;
        if (exitListener) {
            var exitTransition = fragment.getExitTransition();
            if (exitTransition) {
                if (removeListener) {
                    exitTransition.removeListener(exitListener);
                }
                fragment.setExitTransition(null);
                if (trace_1.isEnabled()) {
                    trace_1.write("Cleared Exit " + exitTransition.getClass().getSimpleName() + " transition for " + fragment, trace_1.categories.Transition);
                }
            }
            if (removeListener) {
                entry.exitTransitionListener = null;
            }
        }
        var reenterListener = entry.reenterTransitionListener;
        if (reenterListener) {
            var reenterTransition = fragment.getReenterTransition();
            if (reenterTransition) {
                if (removeListener) {
                    reenterTransition.removeListener(reenterListener);
                }
                fragment.setReenterTransition(null);
                if (trace_1.isEnabled()) {
                    trace_1.write("Cleared Reenter " + reenterTransition.getClass().getSimpleName() + " transition for " + fragment, trace_1.categories.Transition);
                }
            }
            if (removeListener) {
                entry.reenterTransitionListener = null;
            }
        }
    }
}
function clearAllTransitions(fragment) {
    if (!fragment) {
        return;
    }
    clearTransitions(fragment, false);
    if (sdkVersion() >= 21) {
        var entry = getFragmentCallbacks(fragment).entry;
        var enterListener = entry.enterTransitionListener;
        if (enterListener) {
            var enterTransition = fragment.getEnterTransition();
            if (enterTransition) {
                fragment.setEnterTransition(null);
                if (trace_1.isEnabled()) {
                    trace_1.write("Cleared Enter " + enterTransition.getClass().getSimpleName() + " transition for " + fragment, trace_1.categories.Transition);
                }
            }
        }
        var returnListener = entry.returnTransitionListener;
        if (returnListener) {
            var returnTransition = fragment.getReturnTransition();
            if (returnTransition) {
                fragment.setReturnTransition(null);
                if (trace_1.isEnabled()) {
                    trace_1.write("Cleared Return " + returnTransition.getClass().getSimpleName() + " transition for " + fragment, trace_1.categories.Transition);
                }
            }
        }
    }
}
function allowTransitionOverlap(fragment) {
    if (fragment) {
        fragment.setAllowEnterTransitionOverlap(true);
        fragment.setAllowReturnTransitionOverlap(true);
    }
}
function setEnterTransition(navigationTransition, fragment, transition) {
    setUpNativeTransition(navigationTransition, transition);
    var listener = addNativeTransitionListener(fragment, transition);
    getFragmentCallbacks(fragment).entry.enterTransitionListener = listener;
    listener.enterTransition = transition;
    fragment.setEnterTransition(transition);
}
function setExitTransition(navigationTransition, fragment, transition) {
    setUpNativeTransition(navigationTransition, transition);
    var listener = addNativeTransitionListener(fragment, transition);
    getFragmentCallbacks(fragment).entry.exitTransitionListener = listener;
    listener.exitTransition = transition;
    fragment.setExitTransition(transition);
}
function setReenterTransition(navigationTransition, fragment, transition) {
    setUpNativeTransition(navigationTransition, transition);
    var listener = addNativeTransitionListener(fragment, transition);
    getFragmentCallbacks(fragment).entry.reenterTransitionListener = listener;
    listener.reenterTransition = transition;
    fragment.setReenterTransition(transition);
}
function setReturnTransition(navigationTransition, fragment, transition) {
    setUpNativeTransition(navigationTransition, transition);
    var listener = addNativeTransitionListener(fragment, transition);
    getFragmentCallbacks(fragment).entry.returnTransitionListener = listener;
    listener.returnTransition = transition;
    fragment.setReturnTransition(transition);
}
function setupNewFragmentSlideTransition(navTransition, fragment, name) {
    var direction = name.substr("slide".length) || "left";
    switch (direction) {
        case "left":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.LEFT));
            setEnterTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.RIGHT));
            break;
        case "right":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.RIGHT));
            setEnterTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.LEFT));
            break;
        case "top":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.TOP));
            setEnterTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.BOTTOM));
            break;
        case "bottom":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.BOTTOM));
            setEnterTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.TOP));
            break;
    }
}
function setupCurrentFragmentSlideTransition(navTransition, fragment, name) {
    var direction = name.substr("slide".length) || "left";
    switch (direction) {
        case "left":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.LEFT));
            break;
        case "right":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.RIGHT));
            break;
        case "top":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.TOP));
            break;
        case "bottom":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.BOTTOM));
            break;
    }
}
function setupNewFragmentFadeTransition(navTransition, fragment) {
    setupCurrentFragmentFadeTransition(navTransition, fragment);
    var fadeInEnter = new android.transition.Fade(android.transition.Fade.IN);
    setEnterTransition(navTransition, fragment, fadeInEnter);
    var fadeOutReturn = new android.transition.Fade(android.transition.Fade.OUT);
    setReturnTransition(navTransition, fragment, fadeOutReturn);
}
function setupCurrentFragmentFadeTransition(navTransition, fragment) {
    var fadeOutExit = new android.transition.Fade(android.transition.Fade.OUT);
    setExitTransition(navTransition, fragment, fadeOutExit);
    var fadeInReenter = new android.transition.Fade(android.transition.Fade.IN);
    setReenterTransition(navTransition, fragment, fadeInReenter);
}
function setupCurrentFragmentExplodeTransition(navTransition, fragment) {
    setExitTransition(navTransition, fragment, new android.transition.Explode());
}
function setupNewFragmentExplodeTransition(navTransition, fragment) {
    setExitTransition(navTransition, fragment, new android.transition.Explode());
    setEnterTransition(navTransition, fragment, new android.transition.Explode());
}
function setupExitAndPopEnterAnimation(fragment, transition) {
    var entry = getFragmentCallbacks(fragment).entry;
    var listener = getAnimationListener();
    var exitAnimator = transition.createAndroidAnimator(transition_1.AndroidTransitionType.exit);
    exitAnimator.transitionType = transition_1.AndroidTransitionType.exit;
    exitAnimator.fragment = fragment;
    exitAnimator.addListener(listener);
    clearAnimationListener(entry.exitAnimator, listener);
    entry.exitAnimator = exitAnimator;
    var popEnterAnimator = transition.createAndroidAnimator(transition_1.AndroidTransitionType.popEnter);
    popEnterAnimator.transitionType = transition_1.AndroidTransitionType.popEnter;
    popEnterAnimator.fragment = fragment;
    popEnterAnimator.addListener(listener);
    clearAnimationListener(entry.popEnterAnimator, listener);
    entry.popEnterAnimator = popEnterAnimator;
}
function setupAllAnimation(fragment, transition) {
    setupExitAndPopEnterAnimation(fragment, transition);
    var entry = getFragmentCallbacks(fragment).entry;
    var listener = getAnimationListener();
    var enterAnimator = transition.createAndroidAnimator(transition_1.AndroidTransitionType.enter);
    enterAnimator.transitionType = transition_1.AndroidTransitionType.enter;
    enterAnimator.fragment = fragment;
    enterAnimator.addListener(listener);
    entry.enterAnimator = enterAnimator;
    var popExitAnimator = transition.createAndroidAnimator(transition_1.AndroidTransitionType.popExit);
    popExitAnimator.transitionType = transition_1.AndroidTransitionType.popExit;
    popExitAnimator.fragment = fragment;
    popExitAnimator.addListener(listener);
    entry.popExitAnimator = popExitAnimator;
}
function setUpNativeTransition(navigationTransition, nativeTransition) {
    if (navigationTransition.duration) {
        nativeTransition.setDuration(navigationTransition.duration);
    }
    var interpolator = navigationTransition.curve ? animation_1._resolveAnimationCurve(navigationTransition.curve) : defaultInterpolator();
    nativeTransition.setInterpolator(interpolator);
}
function transitionsCompleted(fragment) {
    waitingQueue.delete(fragment);
    return waitingQueue.size === 0;
}
function transitionOrAnimationCompleted(fragment) {
    if (transitionsCompleted(fragment)) {
        var callbacks = getFragmentCallbacks(fragment);
        var entry = callbacks.entry;
        var frame_1 = callbacks.frame;
        var setAsCurrent_1 = frame_1.isCurrent(entry) ? fragmentCompleted : fragment;
        fragmentCompleted = null;
        setTimeout(function () { return frame_1.setCurrent(getFragmentCallbacks(setAsCurrent_1).entry); });
    }
    else {
        fragmentCompleted = fragment;
    }
}
function toShortString(nativeTransition) {
    return nativeTransition.getClass().getSimpleName() + "@" + nativeTransition.hashCode().toString(16);
}
function addNativeTransitionListener(fragment, nativeTransition) {
    var listener = getTransitionListener(fragment);
    nativeTransition.addListener(listener);
    return listener;
}
function javaObjectArray() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    var nativeArray = Array.create(java.lang.Object, params.length);
    params.forEach(function (value, i) { return nativeArray[i] = value; });
    return nativeArray;
}
function javaClassArray() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    var nativeArray = Array.create(java.lang.Class, params.length);
    params.forEach(function (value, i) { return nativeArray[i] = value; });
    return nativeArray;
}
function initDefaultAnimations(manager) {
    if (reflectionDone) {
        return;
    }
    reflectionDone = true;
    loadAnimatorMethod = manager.getClass().getDeclaredMethod("loadAnimator", javaClassArray(android.app.Fragment.class, java.lang.Integer.TYPE, java.lang.Boolean.TYPE, java.lang.Integer.TYPE));
    if (loadAnimatorMethod != null) {
        loadAnimatorMethod.setAccessible(true);
        var fragment_open = java.lang.Integer.valueOf(android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
        var zero = java.lang.Integer.valueOf(0);
        var fragment = new android.app.Fragment();
        defaultEnterAnimatorStatic = loadAnimatorMethod.invoke(manager, javaObjectArray(fragment, fragment_open, java.lang.Boolean.TRUE, zero));
        defaultExitAnimatorStatic = loadAnimatorMethod.invoke(manager, javaObjectArray(fragment, fragment_open, java.lang.Boolean.FALSE, zero));
    }
}
function getDefaultAnimation(enter) {
    var defaultAnimator = enter ? defaultEnterAnimatorStatic : defaultExitAnimatorStatic;
    return defaultAnimator ? defaultAnimator.clone() : null;
}
function createDummyZeroDurationAnimator() {
    var animator = android.animation.ValueAnimator.ofObject(intEvaluator(), javaObjectArray(java.lang.Integer.valueOf(0), java.lang.Integer.valueOf(1)));
    animator.setDuration(0);
    return animator;
}
function printTransitions(fragment) {
    if (fragment && trace_1.isEnabled()) {
        var entry = getFragmentCallbacks(fragment).entry;
        var result = fragment + " Transitions:";
        if (entry.transitionName) {
            result += "transitionName=" + entry.transitionName + ", ";
        }
        if (entry.transition) {
            result += "enterAnimator=" + entry.enterAnimator + ", ";
            result += "exitAnimator=" + entry.exitAnimator + ", ";
            result += "popEnterAnimator=" + entry.popEnterAnimator + ", ";
            result += "popExitAnimator=" + entry.popExitAnimator + ", ";
        }
        if (sdkVersion() >= 21) {
            result += "" + (fragment.getEnterTransition() ? " enter=" + toShortString(fragment.getEnterTransition()) : "");
            result += "" + (fragment.getExitTransition() ? " exit=" + toShortString(fragment.getExitTransition()) : "");
            result += "" + (fragment.getReenterTransition() ? " popEnter=" + toShortString(fragment.getReenterTransition()) : "");
            result += "" + (fragment.getReturnTransition() ? " popExit=" + toShortString(fragment.getReturnTransition()) : "");
        }
        trace_1.write(result, trace_1.categories.Transition);
    }
}
//# sourceMappingURL=fragment.transitions.js.map