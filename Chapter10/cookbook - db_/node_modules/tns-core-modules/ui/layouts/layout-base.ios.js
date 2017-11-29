function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var layout_base_common_1 = require("./layout-base-common");
__export(require("./layout-base-common"));
var LayoutBase = (function (_super) {
    __extends(LayoutBase, _super);
    function LayoutBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LayoutBase.prototype[layout_base_common_1.clipToBoundsProperty.getDefault] = function () {
        return false;
    };
    LayoutBase.prototype[layout_base_common_1.clipToBoundsProperty.setNative] = function (value) {
        this._setNativeClipToBounds();
    };
    LayoutBase.prototype._setNativeClipToBounds = function () {
        if (this.clipToBounds) {
            this.nativeViewProtected.clipsToBounds = true;
        }
        else {
            _super.prototype._setNativeClipToBounds.call(this);
        }
    };
    return LayoutBase;
}(layout_base_common_1.LayoutBaseCommon));
exports.LayoutBase = LayoutBase;
//# sourceMappingURL=layout-base.ios.js.map