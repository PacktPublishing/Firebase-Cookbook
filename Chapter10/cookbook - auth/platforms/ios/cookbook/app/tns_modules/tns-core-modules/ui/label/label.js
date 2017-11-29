function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var background_1 = require("../styling/background");
var text_base_1 = require("../text-base");
var background_2 = require("../styling/background");
__export(require("../text-base"));
var FixedSize;
(function (FixedSize) {
    FixedSize[FixedSize["NONE"] = 0] = "NONE";
    FixedSize[FixedSize["WIDTH"] = 1] = "WIDTH";
    FixedSize[FixedSize["HEIGHT"] = 2] = "HEIGHT";
    FixedSize[FixedSize["BOTH"] = 3] = "BOTH";
})(FixedSize || (FixedSize = {}));
var Label = (function (_super) {
    __extends(Label, _super);
    function Label() {
        var _this = _super.call(this) || this;
        _this.nativeViewProtected = TNSLabel.new();
        _this.nativeViewProtected.userInteractionEnabled = true;
        return _this;
    }
    Object.defineProperty(Label.prototype, "ios", {
        get: function () {
            return this.nativeViewProtected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "textWrap", {
        get: function () {
            return this.style.whiteSpace === "normal";
        },
        set: function (value) {
            if (typeof value === "string") {
                value = text_base_1.booleanConverter(value);
            }
            this.style.whiteSpace = value ? "normal" : "nowrap";
        },
        enumerable: true,
        configurable: true
    });
    Label.prototype._requestLayoutOnTextChanged = function () {
        if (this._fixedSize === FixedSize.BOTH) {
            return;
        }
        if (this._fixedSize === FixedSize.WIDTH && !this.textWrap && this.getMeasuredHeight() > 0) {
            return;
        }
        _super.prototype._requestLayoutOnTextChanged.call(this);
    };
    Label.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var nativeView = this.nativeViewProtected;
        if (nativeView) {
            var width = text_base_1.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = text_base_1.layout.getMeasureSpecMode(widthMeasureSpec);
            var height = text_base_1.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = text_base_1.layout.getMeasureSpecMode(heightMeasureSpec);
            this._fixedSize = (widthMode === text_base_1.layout.EXACTLY ? FixedSize.WIDTH : FixedSize.NONE)
                | (heightMode === text_base_1.layout.EXACTLY ? FixedSize.HEIGHT : FixedSize.NONE);
            var nativeSize = text_base_1.layout.measureNativeView(nativeView, width, widthMode, height, heightMode);
            var labelWidth = nativeSize.width;
            if (this.textWrap && widthMode === text_base_1.layout.AT_MOST) {
                labelWidth = Math.min(labelWidth, width);
            }
            var measureWidth = Math.max(labelWidth, this.effectiveMinWidth);
            var measureHeight = Math.max(nativeSize.height, this.effectiveMinHeight);
            var widthAndState = text_base_1.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = text_base_1.View.resolveSizeAndState(measureHeight, height, heightMode, 0);
            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    };
    Label.prototype[text_base_1.whiteSpaceProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        switch (value) {
            case "normal":
                nativeView.lineBreakMode = 0;
                nativeView.numberOfLines = 0;
                break;
            case "nowrap":
            case "initial":
                nativeView.lineBreakMode = 4;
                nativeView.numberOfLines = 1;
                break;
        }
    };
    Label.prototype._redrawNativeBackground = function (value) {
        var _this = this;
        if (value instanceof background_1.Background) {
            background_2.ios.createBackgroundUIColor(this, function (color) {
                var cgColor = color ? color.CGColor : null;
                _this.nativeViewProtected.layer.backgroundColor = cgColor;
            }, true);
        }
        this._setNativeClipToBounds();
    };
    Label.prototype[text_base_1.borderTopWidthProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: text_base_1.layout.toDeviceIndependentPixels(this.effectiveBorderTopWidth),
            right: border.right,
            bottom: border.bottom,
            left: border.left
        };
    };
    Label.prototype[text_base_1.borderRightWidthProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: text_base_1.layout.toDeviceIndependentPixels(this.effectiveBorderRightWidth),
            bottom: border.bottom,
            left: border.left
        };
    };
    Label.prototype[text_base_1.borderBottomWidthProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: text_base_1.layout.toDeviceIndependentPixels(this.effectiveBorderBottomWidth),
            left: border.left
        };
    };
    Label.prototype[text_base_1.borderLeftWidthProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: border.bottom,
            left: text_base_1.layout.toDeviceIndependentPixels(this.effectiveBorderLeftWidth)
        };
    };
    Label.prototype[text_base_1.paddingTopProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var padding = nativeView.padding;
        nativeView.padding = {
            top: text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingTop),
            right: padding.right,
            bottom: padding.bottom,
            left: padding.left
        };
    };
    Label.prototype[text_base_1.paddingRightProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingRight),
            bottom: padding.bottom,
            left: padding.left
        };
    };
    Label.prototype[text_base_1.paddingBottomProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingBottom),
            left: padding.left
        };
    };
    Label.prototype[text_base_1.paddingLeftProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        var padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: padding.bottom,
            left: text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingLeft)
        };
    };
    return Label;
}(text_base_1.TextBase));
exports.Label = Label;
Label.prototype.recycleNativeView = "auto";
//# sourceMappingURL=label.js.map