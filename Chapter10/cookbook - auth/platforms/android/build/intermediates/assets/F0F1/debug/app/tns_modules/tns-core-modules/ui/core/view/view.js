function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var background_1 = require("../../styling/background");
var view_common_1 = require("./view-common");
var style_properties_1 = require("../../styling/style-properties");
var profiling_1 = require("../../../profiling");
__export(require("./view-common"));
var TouchListener;
var disableUserInteractionListener;
function initializeDisabledListener() {
    if (disableUserInteractionListener) {
        return;
    }
    disableUserInteractionListener = new org.nativescript.widgets.DisableUserInteractionListener();
}
function initializeTouchListener() {
    if (TouchListener) {
        return;
    }
    var TouchListenerImpl = (function (_super) {
        __extends(TouchListenerImpl, _super);
        function TouchListenerImpl(owner) {
            var _this = _super.call(this) || this;
            _this.owner = owner;
            return global.__native(_this);
        }
        TouchListenerImpl.prototype.onTouch = function (view, event) {
            var owner = this.owner;
            for (var type in owner._gestureObservers) {
                var list = owner._gestureObservers[type];
                list.forEach(function (element) {
                    element.androidOnTouchEvent(event);
                });
            }
            var nativeView = owner.nativeViewProtected;
            if (!nativeView || !nativeView.onTouchEvent) {
                return false;
            }
            return nativeView.onTouchEvent(event);
        };
        TouchListenerImpl = __decorate([
            Interfaces([android.view.View.OnTouchListener])
        ], TouchListenerImpl);
        return TouchListenerImpl;
    }(java.lang.Object));
    TouchListener = TouchListenerImpl;
}
var View = (function (_super) {
    __extends(View, _super);
    function View() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    View.prototype.observe = function (type, callback, thisArg) {
        _super.prototype.observe.call(this, type, callback, thisArg);
        if (this.isLoaded && !this.touchListenerIsSet) {
            this.setOnTouchListener();
        }
    };
    View.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this.setOnTouchListener();
    };
    View.prototype.onUnloaded = function () {
        if (this.touchListenerIsSet) {
            this.nativeViewProtected.setOnTouchListener(null);
            this.touchListenerIsSet = false;
            this.nativeViewProtected.setClickable(this._isClickable);
        }
        this._cancelAllAnimations();
        _super.prototype.onUnloaded.call(this);
    };
    View.prototype.hasGestureObservers = function () {
        return this._gestureObservers && Object.keys(this._gestureObservers).length > 0;
    };
    View.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        this._isClickable = this.nativeViewProtected.isClickable();
    };
    View.prototype.setOnTouchListener = function () {
        if (this.nativeViewProtected && this.hasGestureObservers()) {
            this.touchListenerIsSet = true;
            if (this.nativeViewProtected.setClickable) {
                this.nativeViewProtected.setClickable(true);
            }
            initializeTouchListener();
            this.touchListener = this.touchListener || new TouchListener(this);
            this.nativeViewProtected.setOnTouchListener(this.touchListener);
        }
    };
    Object.defineProperty(View.prototype, "isLayoutRequired", {
        get: function () {
            return !this.isLayoutValid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "isLayoutValid", {
        get: function () {
            if (this.nativeViewProtected) {
                return !this.nativeViewProtected.isLayoutRequested();
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    View.prototype.layoutNativeView = function (left, top, right, bottom) {
        if (this.nativeViewProtected) {
            this.nativeViewProtected.layout(left, top, right, bottom);
        }
    };
    View.prototype.requestLayout = function () {
        _super.prototype.requestLayout.call(this);
        if (this.nativeViewProtected) {
            return this.nativeViewProtected.requestLayout();
        }
    };
    View.prototype.measure = function (widthMeasureSpec, heightMeasureSpec) {
        _super.prototype.measure.call(this, widthMeasureSpec, heightMeasureSpec);
        this.onMeasure(widthMeasureSpec, heightMeasureSpec);
    };
    View.prototype.layout = function (left, top, right, bottom) {
        _super.prototype.layout.call(this, left, top, right, bottom);
        this.onLayout(left, top, right, bottom);
    };
    View.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var view = this.nativeViewProtected;
        if (view) {
            view.measure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(view.getMeasuredWidth(), view.getMeasuredHeight());
        }
    };
    View.prototype.onLayout = function (left, top, right, bottom) {
        var view = this.nativeViewProtected;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
        }
    };
    View.prototype._getCurrentLayoutBounds = function () {
        if (this.nativeViewProtected && !this.isCollapsed) {
            return {
                left: this.nativeViewProtected.getLeft(),
                top: this.nativeViewProtected.getTop(),
                right: this.nativeViewProtected.getRight(),
                bottom: this.nativeViewProtected.getBottom()
            };
        }
        else {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        }
    };
    View.prototype.getMeasuredWidth = function () {
        if (this.nativeViewProtected) {
            return this.nativeViewProtected.getMeasuredWidth();
        }
        return _super.prototype.getMeasuredWidth.call(this);
    };
    View.prototype.getMeasuredHeight = function () {
        if (this.nativeViewProtected) {
            return this.nativeViewProtected.getMeasuredHeight();
        }
        return _super.prototype.getMeasuredHeight.call(this);
    };
    View.prototype.focus = function () {
        if (this.nativeViewProtected) {
            return this.nativeViewProtected.requestFocus();
        }
        return false;
    };
    View.prototype.getLocationInWindow = function () {
        if (!this.nativeViewProtected || !this.nativeViewProtected.getWindowToken()) {
            return undefined;
        }
        var nativeArray = Array.create("int", 2);
        this.nativeViewProtected.getLocationInWindow(nativeArray);
        return {
            x: view_common_1.layout.toDeviceIndependentPixels(nativeArray[0]),
            y: view_common_1.layout.toDeviceIndependentPixels(nativeArray[1]),
        };
    };
    View.prototype.getLocationOnScreen = function () {
        if (!this.nativeViewProtected || !this.nativeViewProtected.getWindowToken()) {
            return undefined;
        }
        var nativeArray = Array.create("int", 2);
        this.nativeViewProtected.getLocationOnScreen(nativeArray);
        return {
            x: view_common_1.layout.toDeviceIndependentPixels(nativeArray[0]),
            y: view_common_1.layout.toDeviceIndependentPixels(nativeArray[1]),
        };
    };
    View.prototype.getLocationRelativeTo = function (otherView) {
        if (!this.nativeViewProtected || !this.nativeViewProtected.getWindowToken() ||
            !otherView.nativeViewProtected || !otherView.nativeViewProtected.getWindowToken() ||
            this.nativeViewProtected.getWindowToken() !== otherView.nativeViewProtected.getWindowToken()) {
            return undefined;
        }
        var myArray = Array.create("int", 2);
        this.nativeViewProtected.getLocationOnScreen(myArray);
        var otherArray = Array.create("int", 2);
        otherView.nativeViewProtected.getLocationOnScreen(otherArray);
        return {
            x: view_common_1.layout.toDeviceIndependentPixels(myArray[0] - otherArray[0]),
            y: view_common_1.layout.toDeviceIndependentPixels(myArray[1] - otherArray[1]),
        };
    };
    View.resolveSizeAndState = function (size, specSize, specMode, childMeasuredState) {
        var result = size;
        switch (specMode) {
            case view_common_1.layout.UNSPECIFIED:
                result = size;
                break;
            case view_common_1.layout.AT_MOST:
                if (specSize < size) {
                    result = specSize | view_common_1.layout.MEASURED_STATE_TOO_SMALL;
                }
                break;
            case view_common_1.layout.EXACTLY:
                result = specSize;
                break;
        }
        return result | (childMeasuredState & view_common_1.layout.MEASURED_STATE_MASK);
    };
    View.prototype[view_common_1.isEnabledProperty.setNative] = function (value) {
        this.nativeViewProtected.setEnabled(value);
    };
    View.prototype[view_common_1.originXProperty.getDefault] = function () {
        return this.nativeViewProtected.getPivotX();
    };
    View.prototype[view_common_1.originXProperty.setNative] = function (value) {
        org.nativescript.widgets.OriginPoint.setX(this.nativeViewProtected, value);
    };
    View.prototype[view_common_1.originYProperty.getDefault] = function () {
        return this.nativeViewProtected.getPivotY();
    };
    View.prototype[view_common_1.originYProperty.setNative] = function (value) {
        org.nativescript.widgets.OriginPoint.setY(this.nativeViewProtected, value);
    };
    View.prototype[view_common_1.automationTextProperty.getDefault] = function () {
        return this.nativeViewProtected.getContentDescription();
    };
    View.prototype[view_common_1.automationTextProperty.setNative] = function (value) {
        this.nativeViewProtected.setContentDescription(value);
    };
    View.prototype[view_common_1.isUserInteractionEnabledProperty.setNative] = function (value) {
        if (!value) {
            initializeDisabledListener();
            this.nativeViewProtected.setOnTouchListener(disableUserInteractionListener);
        }
        else {
            this.setOnTouchListener();
            if (!this.touchListenerIsSet) {
                this.nativeViewProtected.setOnTouchListener(null);
            }
        }
    };
    View.prototype[style_properties_1.visibilityProperty.getDefault] = function () {
        var nativeVisibility = this.nativeViewProtected.getVisibility();
        switch (nativeVisibility) {
            case android.view.View.VISIBLE:
                return "visible";
            case android.view.View.INVISIBLE:
                return "hidden";
            case android.view.View.GONE:
                return "collapse";
            default:
                throw new Error("Unsupported android.view.View visibility: " + nativeVisibility + ". Currently supported values are android.view.View.VISIBLE, android.view.View.INVISIBLE, android.view.View.GONE.");
        }
    };
    View.prototype[style_properties_1.visibilityProperty.setNative] = function (value) {
        switch (value) {
            case "visible":
                this.nativeViewProtected.setVisibility(android.view.View.VISIBLE);
                break;
            case "hidden":
                this.nativeViewProtected.setVisibility(android.view.View.INVISIBLE);
                break;
            case "collapse":
                this.nativeViewProtected.setVisibility(android.view.View.GONE);
                break;
            default:
                throw new Error("Invalid visibility value: " + value + ". Valid values are: visible, hidden, collapse.");
        }
    };
    View.prototype[style_properties_1.opacityProperty.getDefault] = function () {
        return this.nativeViewProtected.getAlpha();
    };
    View.prototype[style_properties_1.opacityProperty.setNative] = function (value) {
        this.nativeViewProtected.setAlpha(float(value));
    };
    View.prototype[style_properties_1.horizontalAlignmentProperty.getDefault] = function () {
        return org.nativescript.widgets.ViewHelper.getHorizontalAlignment(this.nativeViewProtected);
    };
    View.prototype[style_properties_1.horizontalAlignmentProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        if (lp.gravity !== undefined) {
            switch (value) {
                case "left":
                    lp.gravity = android.view.Gravity.LEFT | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    if (lp.weight < 0) {
                        lp.weight = -2;
                    }
                    break;
                case "center":
                    lp.gravity = android.view.Gravity.CENTER_HORIZONTAL | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    if (lp.weight < 0) {
                        lp.weight = -2;
                    }
                    break;
                case "right":
                    lp.gravity = android.view.Gravity.RIGHT | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    if (lp.weight < 0) {
                        lp.weight = -2;
                    }
                    break;
                case "stretch":
                    lp.gravity = android.view.Gravity.FILL_HORIZONTAL | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    if (lp.weight < 0) {
                        lp.weight = -1;
                    }
                    break;
            }
            nativeView.setLayoutParams(lp);
        }
    };
    View.prototype[style_properties_1.verticalAlignmentProperty.getDefault] = function () {
        return org.nativescript.widgets.ViewHelper.getVerticalAlignment(this.nativeViewProtected);
    };
    View.prototype[style_properties_1.verticalAlignmentProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        if (lp.gravity !== undefined) {
            switch (value) {
                case "top":
                    lp.gravity = android.view.Gravity.TOP | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    if (lp.height < 0) {
                        lp.height = -2;
                    }
                    break;
                case "middle":
                    lp.gravity = android.view.Gravity.CENTER_VERTICAL | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    if (lp.height < 0) {
                        lp.height = -2;
                    }
                    break;
                case "bottom":
                    lp.gravity = android.view.Gravity.BOTTOM | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    if (lp.height < 0) {
                        lp.height = -2;
                    }
                    break;
                case "stretch":
                    lp.gravity = android.view.Gravity.FILL_VERTICAL | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    if (lp.height < 0) {
                        lp.height = -1;
                    }
                    break;
            }
            nativeView.setLayoutParams(lp);
        }
    };
    View.prototype[style_properties_1.rotateProperty.setNative] = function (value) {
        org.nativescript.widgets.ViewHelper.setRotate(this.nativeViewProtected, float(value));
    };
    View.prototype[style_properties_1.scaleXProperty.setNative] = function (value) {
        org.nativescript.widgets.ViewHelper.setScaleX(this.nativeViewProtected, float(value));
    };
    View.prototype[style_properties_1.scaleYProperty.setNative] = function (value) {
        org.nativescript.widgets.ViewHelper.setScaleY(this.nativeViewProtected, float(value));
    };
    View.prototype[style_properties_1.translateXProperty.setNative] = function (value) {
        org.nativescript.widgets.ViewHelper.setTranslateX(this.nativeViewProtected, view_common_1.layout.toDevicePixels(value));
    };
    View.prototype[style_properties_1.translateYProperty.setNative] = function (value) {
        org.nativescript.widgets.ViewHelper.setTranslateY(this.nativeViewProtected, view_common_1.layout.toDevicePixels(value));
    };
    View.prototype[style_properties_1.zIndexProperty.getDefault] = function () {
        return 0;
    };
    View.prototype[style_properties_1.zIndexProperty.setNative] = function (value) {
        org.nativescript.widgets.ViewHelper.setZIndex(this.nativeViewProtected, value);
    };
    View.prototype[style_properties_1.backgroundInternalProperty.getDefault] = function () {
        var nativeView = this.nativeViewProtected;
        var drawable = nativeView.getBackground();
        if (drawable) {
            var constantState = drawable.getConstantState();
            if (constantState) {
                return constantState.newDrawable(nativeView.getResources());
            }
            else {
                return drawable;
            }
        }
        return null;
    };
    View.prototype[style_properties_1.backgroundInternalProperty.setNative] = function (value) {
        this._redrawNativeBackground(value);
    };
    View.prototype[style_properties_1.minWidthProperty.setNative] = function (value) {
        if (this.parent instanceof CustomLayoutView && this.parent.nativeViewProtected) {
            this.parent._setChildMinWidthNative(this);
        }
        else {
            this._setMinWidthNative(this.minWidth);
        }
    };
    View.prototype[style_properties_1.minHeightProperty.setNative] = function (value) {
        if (this.parent instanceof CustomLayoutView && this.parent.nativeViewProtected) {
            this.parent._setChildMinHeightNative(this);
        }
        else {
            this._setMinHeightNative(this.minHeight);
        }
    };
    View.prototype._redrawNativeBackground = function (value) {
        if (value instanceof background_1.Background) {
            background_1.ad.onBackgroundOrBorderPropertyChanged(this);
        }
        else {
            var nativeView = this.nativeViewProtected;
            org.nativescript.widgets.ViewHelper.setBackground(nativeView, value);
            var style = this.style;
            var paddingTop = view_common_1.paddingTopProperty.isSet(style) ? this.effectivePaddingTop : this._defaultPaddingTop;
            var paddingRight = view_common_1.paddingRightProperty.isSet(style) ? this.effectivePaddingRight : this._defaultPaddingRight;
            var paddingBottom = view_common_1.paddingBottomProperty.isSet(style) ? this.effectivePaddingBottom : this._defaultPaddingBottom;
            var paddingLeft = view_common_1.paddingLeftProperty.isSet(style) ? this.effectivePaddingLeft : this._defaultPaddingLeft;
            if (this._isPaddingRelative) {
                nativeView.setPaddingRelative(paddingLeft, paddingTop, paddingRight, paddingBottom);
            }
            else {
                nativeView.setPadding(paddingLeft, paddingTop, paddingRight, paddingBottom);
            }
            nativeView.background = undefined;
        }
    };
    __decorate([
        profiling_1.profile
    ], View.prototype, "onLoaded", null);
    __decorate([
        profiling_1.profile
    ], View.prototype, "onUnloaded", null);
    __decorate([
        profiling_1.profile
    ], View.prototype, "requestLayout", null);
    return View;
}(view_common_1.ViewCommon));
exports.View = View;
var CustomLayoutView = (function (_super) {
    __extends(CustomLayoutView, _super);
    function CustomLayoutView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomLayoutView.prototype.createNativeView = function () {
        return new org.nativescript.widgets.ContentLayout(this._context);
    };
    CustomLayoutView.prototype._addViewToNativeVisualTree = function (child, atIndex) {
        if (atIndex === void 0) { atIndex = -1; }
        _super.prototype._addViewToNativeVisualTree.call(this, child);
        if (this.nativeViewProtected && child.nativeViewProtected) {
            if (view_common_1.traceEnabled()) {
                view_common_1.traceWrite(this + ".nativeView.addView(" + child + ".nativeView, " + atIndex + ")", view_common_1.traceCategories.VisualTreeEvents);
            }
            this.nativeViewProtected.addView(child.nativeViewProtected, atIndex);
            if (child instanceof View) {
                this._updateNativeLayoutParams(child);
            }
            return true;
        }
        return false;
    };
    CustomLayoutView.prototype._updateNativeLayoutParams = function (child) {
        this._setChildMinWidthNative(child);
        this._setChildMinHeightNative(child);
    };
    CustomLayoutView.prototype._setChildMinWidthNative = function (child) {
        child._setMinWidthNative(child.minWidth);
    };
    CustomLayoutView.prototype._setChildMinHeightNative = function (child) {
        child._setMinHeightNative(child.minHeight);
    };
    CustomLayoutView.prototype._removeViewFromNativeVisualTree = function (child) {
        _super.prototype._removeViewFromNativeVisualTree.call(this, child);
        var nativeView = this.nativeViewProtected;
        var childView = child.nativeViewProtected;
        if (nativeView && childView) {
            nativeView.removeView(childView);
            if (view_common_1.traceEnabled()) {
                view_common_1.traceWrite(nativeView + ".removeView(" + childView + ")", view_common_1.traceCategories.VisualTreeEvents);
                view_common_1.traceNotifyEvent(child, "childInLayoutRemovedFromNativeVisualTree");
            }
        }
    };
    return CustomLayoutView;
}(View));
exports.CustomLayoutView = CustomLayoutView;
var percentNotSupported = function (view, value) { throw new Error("PercentLength is not supported."); };
function createNativePercentLengthProperty(options) {
    var getter = options.getter, setter = options.setter, _a = options.auto, auto = _a === void 0 ? 0 : _a;
    var setPixels, getPixels, setPercent;
    if (getter) {
        View.prototype[getter] = function () {
            if (options) {
                setPixels = options.setPixels;
                getPixels = options.getPixels;
                setPercent = options.setPercent || percentNotSupported;
                options = null;
            }
            var value = getPixels(this.nativeViewProtected);
            if (value == auto) {
                return "auto";
            }
            else {
                return { value: value, unit: "px" };
            }
        };
    }
    if (setter) {
        View.prototype[setter] = function (length) {
            if (options) {
                setPixels = options.setPixels;
                getPixels = options.getPixels;
                setPercent = options.setPercent || percentNotSupported;
                options = null;
            }
            if (length == "auto") {
                setPixels(this.nativeViewProtected, auto);
            }
            else if (typeof length === "number") {
                setPixels(this.nativeViewProtected, view_common_1.layout.round(view_common_1.layout.toDevicePixels(length)));
            }
            else if (length.unit == "dip") {
                setPixels(this.nativeViewProtected, view_common_1.layout.round(view_common_1.layout.toDevicePixels(length.value)));
            }
            else if (length.unit == "px") {
                setPixels(this.nativeViewProtected, view_common_1.layout.round(length.value));
            }
            else if (length.unit == "%") {
                setPercent(this.nativeViewProtected, length.value);
            }
            else {
                throw new Error("Unsupported PercentLength " + length);
            }
        };
    }
}
createNativePercentLengthProperty({
    setter: style_properties_1.marginTopProperty.setNative,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginTop; },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginTopPercent; }
});
createNativePercentLengthProperty({
    setter: style_properties_1.marginRightProperty.setNative,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginRight; },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginRightPercent; }
});
createNativePercentLengthProperty({
    setter: style_properties_1.marginBottomProperty.setNative,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginBottom; },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginBottomPercent; }
});
createNativePercentLengthProperty({
    setter: style_properties_1.marginLeftProperty.setNative,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginLeft; },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginLeftPercent; }
});
createNativePercentLengthProperty({
    setter: style_properties_1.widthProperty.setNative,
    auto: -1,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setWidth; },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setWidthPercent; }
});
createNativePercentLengthProperty({
    setter: style_properties_1.heightProperty.setNative,
    auto: -1,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setHeight; },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setHeightPercent; }
});
createNativePercentLengthProperty({
    setter: "_setMinWidthNative",
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMinWidth; }
});
createNativePercentLengthProperty({
    setter: "_setMinHeightNative",
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMinHeight; }
});
//# sourceMappingURL=view.js.map