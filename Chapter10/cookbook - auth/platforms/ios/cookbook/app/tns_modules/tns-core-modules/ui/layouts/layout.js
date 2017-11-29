function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var layout_base_1 = require("./layout-base");
__export(require("./layout-base"));
var Layout = (function (_super) {
    __extends(Layout, _super);
    function Layout() {
        var _this = _super.call(this) || this;
        _this.nativeViewProtected = UIView.new();
        return _this;
    }
    Object.defineProperty(Layout.prototype, "ios", {
        get: function () {
            return this.nativeViewProtected;
        },
        enumerable: true,
        configurable: true
    });
    Layout.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
    };
    return Layout;
}(layout_base_1.LayoutBase));
exports.Layout = Layout;
//# sourceMappingURL=layout.js.map