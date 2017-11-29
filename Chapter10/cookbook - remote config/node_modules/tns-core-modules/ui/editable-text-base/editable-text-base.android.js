function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var editable_text_base_common_1 = require("./editable-text-base-common");
var utils_1 = require("../../utils/utils");
__export(require("./editable-text-base-common"));
var dismissKeyboardTimeoutId;
var EditTextListeners;
function initializeEditTextListeners() {
    if (EditTextListeners) {
        return;
    }
    var EditTextListenersImpl = (function (_super) {
        __extends(EditTextListenersImpl, _super);
        function EditTextListenersImpl(owner) {
            var _this = _super.call(this) || this;
            _this.owner = owner;
            return global.__native(_this);
        }
        EditTextListenersImpl.prototype.beforeTextChanged = function (text, start, count, after) {
        };
        EditTextListenersImpl.prototype.onTextChanged = function (text, start, before, count) {
        };
        EditTextListenersImpl.prototype.afterTextChanged = function (editable) {
            var owner = this.owner;
            if (!owner || owner._changeFromCode) {
                return;
            }
            switch (owner.updateTextTrigger) {
                case "focusLost":
                    owner._dirtyTextAccumulator = editable.toString();
                    break;
                case "textChanged":
                    editable_text_base_common_1.textProperty.nativeValueChange(owner, editable.toString());
                    break;
                default:
                    throw new Error("Invalid updateTextTrigger: " + owner.updateTextTrigger);
            }
        };
        EditTextListenersImpl.prototype.onFocusChange = function (view, hasFocus) {
            var owner = this.owner;
            if (!owner) {
                return;
            }
            if (hasFocus) {
                if (dismissKeyboardTimeoutId) {
                    clearTimeout(dismissKeyboardTimeoutId);
                    dismissKeyboardTimeoutId = undefined;
                }
                owner.notify({ eventName: EditableTextBase.focusEvent, object: owner });
            }
            else {
                if (owner._dirtyTextAccumulator || owner._dirtyTextAccumulator === "") {
                    editable_text_base_common_1.textProperty.nativeValueChange(owner, owner._dirtyTextAccumulator);
                    owner._dirtyTextAccumulator = undefined;
                }
                dismissKeyboardTimeoutId = setTimeout(function () {
                    owner.dismissSoftInput();
                    dismissKeyboardTimeoutId = null;
                }, 1);
                owner.notify({ eventName: EditableTextBase.blurEvent, object: owner });
            }
        };
        EditTextListenersImpl.prototype.onEditorAction = function (textView, actionId, event) {
            var owner = this.owner;
            if (!owner) {
                return;
            }
            if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_DONE ||
                actionId === android.view.inputmethod.EditorInfo.IME_ACTION_GO ||
                actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH ||
                actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEND ||
                (event && event.getKeyCode() === android.view.KeyEvent.KEYCODE_ENTER)) {
                if (textView.getMaxLines() === 1) {
                    owner.dismissSoftInput();
                }
                owner._onReturnPress();
            }
            if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_NEXT) {
                owner._onReturnPress();
            }
            return false;
        };
        EditTextListenersImpl = __decorate([
            Interfaces([android.text.TextWatcher, android.view.View.OnFocusChangeListener, android.widget.TextView.OnEditorActionListener])
        ], EditTextListenersImpl);
        return EditTextListenersImpl;
    }(java.lang.Object));
    EditTextListeners = EditTextListenersImpl;
}
var EditableTextBase = (function (_super) {
    __extends(EditableTextBase, _super);
    function EditableTextBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EditableTextBase.prototype._onReturnPress = function () {
    };
    EditableTextBase.prototype.createNativeView = function () {
        initializeEditTextListeners();
        var editText = new android.widget.EditText(this._context);
        this._configureEditText(editText);
        var listeners = new EditTextListeners(this);
        editText.addTextChangedListener(listeners);
        editText.setOnFocusChangeListener(listeners);
        editText.setOnEditorActionListener(listeners);
        editText.listener = listeners;
        return editText;
    };
    EditableTextBase.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        var nativeView = this.nativeViewProtected;
        nativeView.listener.owner = this;
        this._inputType = nativeView.getInputType();
    };
    EditableTextBase.prototype.disposeNativeView = function () {
        _super.prototype.disposeNativeView.call(this);
        this.nativeViewProtected.listener.owner = null;
        this._keyListenerCache = null;
    };
    EditableTextBase.prototype.resetNativeView = function () {
        _super.prototype.resetNativeView.call(this);
        this.nativeViewProtected.setInputType(this._inputType);
    };
    EditableTextBase.prototype.dismissSoftInput = function () {
        utils_1.ad.dismissSoftInput(this.nativeViewProtected);
    };
    EditableTextBase.prototype.focus = function () {
        var result = _super.prototype.focus.call(this);
        if (result) {
            utils_1.ad.showSoftInput(this.nativeViewProtected);
        }
        return result;
    };
    EditableTextBase.prototype._setInputType = function (inputType) {
        var nativeView = this.nativeViewProtected;
        try {
            this._changeFromCode = true;
            nativeView.setInputType(inputType);
        }
        finally {
            this._changeFromCode = false;
        }
        var listener = nativeView.getKeyListener();
        if (listener) {
            this._keyListenerCache = listener;
        }
        if (!this.editable) {
            nativeView.setKeyListener(null);
        }
    };
    EditableTextBase.prototype[editable_text_base_common_1.textProperty.getDefault] = function () {
        return -1;
    };
    EditableTextBase.prototype[editable_text_base_common_1.textProperty.setNative] = function (value) {
        try {
            this._changeFromCode = true;
            this._setNativeText(value === -1);
        }
        finally {
            this._changeFromCode = false;
        }
    };
    EditableTextBase.prototype[editable_text_base_common_1.keyboardTypeProperty.getDefault] = function () {
        return this.nativeViewProtected.getInputType();
    };
    EditableTextBase.prototype[editable_text_base_common_1.keyboardTypeProperty.setNative] = function (value) {
        var newInputType;
        switch (value) {
            case "datetime":
                newInputType = android.text.InputType.TYPE_CLASS_DATETIME | android.text.InputType.TYPE_DATETIME_VARIATION_NORMAL;
                break;
            case "phone":
                newInputType = android.text.InputType.TYPE_CLASS_PHONE;
                break;
            case "number":
                newInputType = android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL;
                break;
            case "url":
                newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI;
                break;
            case "email":
                newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS;
                break;
            default:
                newInputType = value;
                break;
        }
        this._setInputType(newInputType);
    };
    EditableTextBase.prototype[editable_text_base_common_1.returnKeyTypeProperty.getDefault] = function () {
        var ime = this.nativeViewProtected.getImeOptions();
        switch (ime) {
            case android.view.inputmethod.EditorInfo.IME_ACTION_DONE:
                return "done";
            case android.view.inputmethod.EditorInfo.IME_ACTION_GO:
                return "go";
            case android.view.inputmethod.EditorInfo.IME_ACTION_NEXT:
                return "next";
            case android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH:
                return "search";
            case android.view.inputmethod.EditorInfo.IME_ACTION_SEND:
                return "send";
            default:
                return ime.toString();
        }
    };
    EditableTextBase.prototype[editable_text_base_common_1.returnKeyTypeProperty.setNative] = function (value) {
        var newImeOptions;
        switch (value) {
            case "done":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_DONE;
                break;
            case "go":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_GO;
                break;
            case "next":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_NEXT;
                break;
            case "search":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH;
                break;
            case "send":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEND;
                break;
            default:
                var ime = +value;
                if (!isNaN(ime)) {
                    newImeOptions = ime;
                }
                else {
                    newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_UNSPECIFIED;
                }
                break;
        }
        this.nativeViewProtected.setImeOptions(newImeOptions);
    };
    EditableTextBase.prototype[editable_text_base_common_1.editableProperty.setNative] = function (value) {
        var nativeView = this.nativeViewProtected;
        if (value) {
            nativeView.setKeyListener(this._keyListenerCache);
        }
        else {
            if (!this._keyListenerCache) {
                this._keyListenerCache = nativeView.getKeyListener();
            }
            nativeView.setKeyListener(null);
        }
    };
    EditableTextBase.prototype[editable_text_base_common_1.autocapitalizationTypeProperty.getDefault] = function () {
        var inputType = this.nativeViewProtected.getInputType();
        if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) {
            return "words";
        }
        else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) === android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) {
            return "sentences";
        }
        else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) {
            return "allcharacters";
        }
        else {
            return inputType.toString();
        }
    };
    EditableTextBase.prototype[editable_text_base_common_1.autocapitalizationTypeProperty.setNative] = function (value) {
        var inputType = this.nativeViewProtected.getInputType();
        inputType = inputType & ~28672;
        switch (value) {
            case "none":
                break;
            case "words":
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS;
                break;
            case "sentences":
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES;
                break;
            case "allcharacters":
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS;
                break;
            default:
                var number = +value;
                if (!isNaN(number)) {
                    inputType = number;
                }
                else {
                    inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES;
                }
                break;
        }
        this._setInputType(inputType);
    };
    EditableTextBase.prototype[editable_text_base_common_1.autocorrectProperty.getDefault] = function () {
        var autocorrect = this.nativeViewProtected.getInputType();
        if ((autocorrect & android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) === android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) {
            return true;
        }
        return false;
    };
    EditableTextBase.prototype[editable_text_base_common_1.autocorrectProperty.setNative] = function (value) {
        var inputType = this.nativeViewProtected.getInputType();
        switch (value) {
            case true:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE;
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
                inputType = inputType & ~android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS;
                break;
            case false:
                inputType = inputType & ~android.text.InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE;
                inputType = inputType & ~android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS;
                break;
            default:
                break;
        }
        this._setInputType(inputType);
    };
    EditableTextBase.prototype[editable_text_base_common_1.hintProperty.getDefault] = function () {
        return this.nativeViewProtected.getHint();
    };
    EditableTextBase.prototype[editable_text_base_common_1.hintProperty.setNative] = function (value) {
        var text = (value === null || value === undefined) ? null : value.toString();
        this.nativeViewProtected.setHint(text);
    };
    EditableTextBase.prototype[editable_text_base_common_1.placeholderColorProperty.getDefault] = function () {
        return this.nativeViewProtected.getHintTextColors();
    };
    EditableTextBase.prototype[editable_text_base_common_1.placeholderColorProperty.setNative] = function (value) {
        var color = value instanceof editable_text_base_common_1.Color ? value.android : value;
        this.nativeViewProtected.setHintTextColor(color);
    };
    EditableTextBase.prototype[editable_text_base_common_1.textTransformProperty.setNative] = function (value) {
    };
    EditableTextBase.prototype[editable_text_base_common_1.maxLengthProperty.setNative] = function (value) {
        if (value === Number.POSITIVE_INFINITY) {
            this.nativeViewProtected.setFilters([]);
        }
        else {
            var lengthFilter = new android.text.InputFilter.LengthFilter(value);
            var filters = this.nativeViewProtected.getFilters();
            var newFilters = [];
            for (var i = 0; i < filters.length; i++) {
                var filter_1 = filters[i];
                if (!(filter_1 instanceof android.text.InputFilter.LengthFilter)) {
                    newFilters.push(filter_1);
                }
            }
            newFilters.push(lengthFilter);
            this.nativeViewProtected.setFilters(newFilters);
        }
    };
    return EditableTextBase;
}(editable_text_base_common_1.EditableTextBase));
exports.EditableTextBase = EditableTextBase;
//# sourceMappingURL=editable-text-base.android.js.map