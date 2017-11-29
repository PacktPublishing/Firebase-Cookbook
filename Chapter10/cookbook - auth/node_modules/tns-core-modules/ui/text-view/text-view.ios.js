function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var editable_text_base_1 = require("../editable-text-base");
var profiling_1 = require("../../profiling");
__export(require("../editable-text-base"));
var UITextViewDelegateImpl = (function (_super) {
    __extends(UITextViewDelegateImpl, _super);
    function UITextViewDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UITextViewDelegateImpl.initWithOwner = function (owner) {
        var impl = UITextViewDelegateImpl.new();
        impl._owner = owner;
        return impl;
    };
    UITextViewDelegateImpl.prototype.textViewShouldBeginEditing = function (textView) {
        var owner = this._owner.get();
        if (owner) {
            owner.showText();
        }
        return true;
    };
    UITextViewDelegateImpl.prototype.textViewDidBeginEditing = function (textView) {
        var owner = this._owner.get();
        if (owner) {
            owner._isEditing = true;
            owner.notify({ eventName: TextView.focusEvent, object: owner });
        }
    };
    UITextViewDelegateImpl.prototype.textViewDidEndEditing = function (textView) {
        var owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === "focusLost") {
                editable_text_base_1.textProperty.nativeValueChange(owner, textView.text);
            }
            owner._isEditing = false;
            owner.dismissSoftInput();
            owner._refreshHintState(owner.hint, textView.text);
        }
    };
    UITextViewDelegateImpl.prototype.textViewDidChange = function (textView) {
        var owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === "textChanged") {
                editable_text_base_1.textProperty.nativeValueChange(owner, textView.text);
            }
        }
    };
    UITextViewDelegateImpl.prototype.textViewShouldChangeTextInRangeReplacementText = function (textView, range, replacementString) {
        var owner = this._owner.get();
        if (owner) {
            var delta = replacementString.length - range.length;
            if (delta > 0) {
                if (textView.text.length + delta > owner.maxLength) {
                    return false;
                }
            }
            if (owner.formattedText) {
                editable_text_base_1._updateCharactersInRangeReplacementString(owner.formattedText, range.location, range.length, replacementString);
            }
        }
        return true;
    };
    UITextViewDelegateImpl.prototype.scrollViewDidScroll = function (sv) {
        var owner = this._owner.get();
        if (owner) {
            var contentOffset = owner.nativeViewProtected.contentOffset;
            owner.notify({
                object: owner,
                eventName: "scroll",
                scrollX: contentOffset.x,
                scrollY: contentOffset.y
            });
        }
    };
    UITextViewDelegateImpl.ObjCProtocols = [UITextViewDelegate, UIScrollViewDelegate];
    return UITextViewDelegateImpl;
}(NSObject));
var TextView = (function (_super) {
    __extends(TextView, _super);
    function TextView() {
        var _this = _super.call(this) || this;
        _this.nativeViewProtected = _this._ios = UITextView.new();
        if (!_this._ios.font) {
            _this._ios.font = UIFont.systemFontOfSize(12);
        }
        _this._delegate = UITextViewDelegateImpl.initWithOwner(new WeakRef(_this));
        return _this;
    }
    TextView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this._ios.delegate = this._delegate;
    };
    TextView.prototype.onUnloaded = function () {
        this._ios.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    Object.defineProperty(TextView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    TextView.prototype._refreshHintState = function (hint, text) {
        if (this.formattedText) {
            return;
        }
        if (text !== null && text !== undefined && text !== '') {
            this.showText();
        }
        else if (!this._isEditing && hint !== null && hint !== undefined && hint !== '') {
            this.showHint(hint);
        }
        else {
            this._isShowingHint = false;
            this.nativeViewProtected.text = '';
        }
    };
    TextView.prototype._refreshColor = function () {
        if (this._isShowingHint) {
            var placeholderColor = this.style.placeholderColor;
            var color = this.style.color;
            if (placeholderColor) {
                this.nativeViewProtected.textColor = placeholderColor.ios;
            }
            else if (color) {
                this.nativeViewProtected.textColor = color.ios.colorWithAlphaComponent(0.22);
            }
            else {
                this.nativeViewProtected.textColor = UIColor.blackColor.colorWithAlphaComponent(0.22);
            }
        }
        else {
            var color = this.style.color;
            if (color) {
                this.nativeViewProtected.textColor = color.ios;
                this.nativeViewProtected.tintColor = color.ios;
            }
            else {
                this.nativeViewProtected.textColor = null;
                this.nativeViewProtected.tintColor = null;
            }
        }
    };
    TextView.prototype.showHint = function (hint) {
        var nativeView = this.nativeViewProtected;
        this._isShowingHint = true;
        this._refreshColor();
        var hintAsString = (hint === null || hint === undefined) ? '' : hint.toString();
        nativeView.text = hintAsString;
    };
    TextView.prototype.showText = function () {
        this._isShowingHint = false;
        this._refreshColor();
        this._setNativeText();
    };
    TextView.prototype[editable_text_base_1.textProperty.getDefault] = function () {
        return "";
    };
    TextView.prototype[editable_text_base_1.textProperty.setNative] = function (value) {
        this._refreshHintState(this.hint, value);
    };
    TextView.prototype[editable_text_base_1.hintProperty.getDefault] = function () {
        return "";
    };
    TextView.prototype[editable_text_base_1.hintProperty.setNative] = function (value) {
        this._refreshHintState(value, this.text);
    };
    TextView.prototype[editable_text_base_1.editableProperty.getDefault] = function () {
        return this.nativeViewProtected.editable;
    };
    TextView.prototype[editable_text_base_1.editableProperty.setNative] = function (value) {
        this.nativeViewProtected.editable = value;
    };
    TextView.prototype[editable_text_base_1.colorProperty.setNative] = function (color) {
        this._refreshColor();
    };
    TextView.prototype[editable_text_base_1.placeholderColorProperty.setNative] = function (value) {
        this._refreshColor();
    };
    TextView.prototype[editable_text_base_1.borderTopWidthProperty.getDefault] = function () {
        return {
            value: this.nativeViewProtected.textContainerInset.top,
            unit: "px"
        };
    };
    TextView.prototype[editable_text_base_1.borderTopWidthProperty.setNative] = function (value) {
        var inset = this.nativeViewProtected.textContainerInset;
        var top = editable_text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
        this.nativeViewProtected.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    };
    TextView.prototype[editable_text_base_1.borderRightWidthProperty.getDefault] = function () {
        return {
            value: this.nativeViewProtected.textContainerInset.right,
            unit: "px"
        };
    };
    TextView.prototype[editable_text_base_1.borderRightWidthProperty.setNative] = function (value) {
        var inset = this.nativeViewProtected.textContainerInset;
        var right = editable_text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
        this.nativeViewProtected.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    };
    TextView.prototype[editable_text_base_1.borderBottomWidthProperty.getDefault] = function () {
        return {
            value: this.nativeViewProtected.textContainerInset.bottom,
            unit: "px"
        };
    };
    TextView.prototype[editable_text_base_1.borderBottomWidthProperty.setNative] = function (value) {
        var inset = this.nativeViewProtected.textContainerInset;
        var bottom = editable_text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
        this.nativeViewProtected.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    };
    TextView.prototype[editable_text_base_1.borderLeftWidthProperty.getDefault] = function () {
        return {
            value: this.nativeViewProtected.textContainerInset.left,
            unit: "px"
        };
    };
    TextView.prototype[editable_text_base_1.borderLeftWidthProperty.setNative] = function (value) {
        var inset = this.nativeViewProtected.textContainerInset;
        var left = editable_text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeViewProtected.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    };
    TextView.prototype[editable_text_base_1.paddingTopProperty.getDefault] = function () {
        return {
            value: this.nativeViewProtected.textContainerInset.top,
            unit: "px"
        };
    };
    TextView.prototype[editable_text_base_1.paddingTopProperty.setNative] = function (value) {
        var inset = this.nativeViewProtected.textContainerInset;
        var top = editable_text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
        this.nativeViewProtected.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    };
    TextView.prototype[editable_text_base_1.paddingRightProperty.getDefault] = function () {
        return {
            value: this.nativeViewProtected.textContainerInset.right,
            unit: "px"
        };
    };
    TextView.prototype[editable_text_base_1.paddingRightProperty.setNative] = function (value) {
        var inset = this.nativeViewProtected.textContainerInset;
        var right = editable_text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
        this.nativeViewProtected.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    };
    TextView.prototype[editable_text_base_1.paddingBottomProperty.getDefault] = function () {
        return {
            value: this.nativeViewProtected.textContainerInset.bottom,
            unit: "px"
        };
    };
    TextView.prototype[editable_text_base_1.paddingBottomProperty.setNative] = function (value) {
        var inset = this.nativeViewProtected.textContainerInset;
        var bottom = editable_text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
        this.nativeViewProtected.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    };
    TextView.prototype[editable_text_base_1.paddingLeftProperty.getDefault] = function () {
        return {
            value: this.nativeViewProtected.textContainerInset.left,
            unit: "px"
        };
    };
    TextView.prototype[editable_text_base_1.paddingLeftProperty.setNative] = function (value) {
        var inset = this.nativeViewProtected.textContainerInset;
        var left = editable_text_base_1.layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeViewProtected.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    };
    __decorate([
        profiling_1.profile
    ], TextView.prototype, "onLoaded", null);
    return TextView;
}(editable_text_base_1.EditableTextBase));
exports.TextView = TextView;
TextView.prototype.recycleNativeView = "auto";
//# sourceMappingURL=text-view.ios.js.map