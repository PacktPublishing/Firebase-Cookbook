Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../utils/utils");
var getter = utils.ios.getter;
var ios;
(function (ios) {
    function getActualHeight(view) {
        if (view.window && !view.hidden) {
            return view.frame.size.height;
        }
        return 0;
    }
    ios.getActualHeight = getActualHeight;
    function getStatusBarHeight() {
        var app = getter(UIApplication, UIApplication.sharedApplication);
        if (!app || app.statusBarHidden) {
            return 0;
        }
        var statusFrame = app.statusBarFrame;
        var min = Math.min(statusFrame.size.width, statusFrame.size.height);
        return utils.layout.toDevicePixels(min);
    }
    ios.getStatusBarHeight = getStatusBarHeight;
    function _layoutRootView(rootView, parentBounds) {
        if (!rootView || !parentBounds) {
            return;
        }
        var size = parentBounds.size;
        var width = utils.layout.toDevicePixels(size.width);
        var height = utils.layout.toDevicePixels(size.height);
        var superview = rootView.nativeViewProtected.superview;
        var superViewRotationRadians;
        if (superview) {
            superViewRotationRadians = atan2f(superview.transform.b, superview.transform.a);
        }
        var origin = parentBounds.origin;
        var left = origin.x;
        var top = origin.y;
        var widthSpec = utils.layout.makeMeasureSpec(width, utils.layout.EXACTLY);
        var heightSpec = utils.layout.makeMeasureSpec(height, utils.layout.EXACTLY);
        rootView.measure(widthSpec, heightSpec);
        rootView.layout(left, top, width, height);
    }
    ios._layoutRootView = _layoutRootView;
})(ios = exports.ios || (exports.ios = {}));
//# sourceMappingURL=utils.js.map