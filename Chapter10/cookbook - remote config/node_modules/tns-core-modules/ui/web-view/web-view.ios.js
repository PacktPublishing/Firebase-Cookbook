function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var web_view_common_1 = require("./web-view-common");
var profiling_1 = require("../../profiling");
__export(require("./web-view-common"));
var UIWebViewDelegateImpl = (function (_super) {
    __extends(UIWebViewDelegateImpl, _super);
    function UIWebViewDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UIWebViewDelegateImpl.initWithOwner = function (owner) {
        var delegate = UIWebViewDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UIWebViewDelegateImpl.prototype.webViewShouldStartLoadWithRequestNavigationType = function (webView, request, navigationType) {
        var owner = this._owner.get();
        if (owner && request.URL) {
            var navType = "other";
            switch (navigationType) {
                case 0:
                    navType = "linkClicked";
                    break;
                case 1:
                    navType = "formSubmitted";
                    break;
                case 2:
                    navType = "backForward";
                    break;
                case 3:
                    navType = "reload";
                    break;
                case 4:
                    navType = "formResubmitted";
                    break;
            }
            if (web_view_common_1.traceEnabled()) {
                web_view_common_1.traceWrite("UIWebViewDelegateClass.webViewShouldStartLoadWithRequestNavigationType(" + request.URL.absoluteString + ", " + navigationType + ")", web_view_common_1.traceCategories.Debug);
            }
            owner._onLoadStarted(request.URL.absoluteString, navType);
        }
        return true;
    };
    UIWebViewDelegateImpl.prototype.webViewDidStartLoad = function (webView) {
        if (web_view_common_1.traceEnabled()) {
            web_view_common_1.traceWrite("UIWebViewDelegateClass.webViewDidStartLoad(" + webView.request.URL + ")", web_view_common_1.traceCategories.Debug);
        }
    };
    UIWebViewDelegateImpl.prototype.webViewDidFinishLoad = function (webView) {
        if (web_view_common_1.traceEnabled()) {
            web_view_common_1.traceWrite("UIWebViewDelegateClass.webViewDidFinishLoad(" + webView.request.URL + ")", web_view_common_1.traceCategories.Debug);
        }
        var owner = this._owner.get();
        if (owner) {
            owner._onLoadFinished(webView.request.URL.absoluteString);
        }
    };
    UIWebViewDelegateImpl.prototype.webViewDidFailLoadWithError = function (webView, error) {
        var owner = this._owner.get();
        if (owner) {
            var src = owner.src;
            if (webView.request && webView.request.URL) {
                src = webView.request.URL.absoluteString;
            }
            if (web_view_common_1.traceEnabled()) {
                web_view_common_1.traceWrite("UIWebViewDelegateClass.webViewDidFailLoadWithError(" + error.localizedDescription + ")", web_view_common_1.traceCategories.Debug);
            }
            if (owner) {
                owner._onLoadFinished(src, error.localizedDescription);
            }
        }
    };
    UIWebViewDelegateImpl.ObjCProtocols = [UIWebViewDelegate];
    return UIWebViewDelegateImpl;
}(NSObject));
var WebView = (function (_super) {
    __extends(WebView, _super);
    function WebView() {
        var _this = _super.call(this) || this;
        _this.nativeViewProtected = _this._ios = UIWebView.new();
        _this._delegate = UIWebViewDelegateImpl.initWithOwner(new WeakRef(_this));
        return _this;
    }
    WebView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this._ios.delegate = this._delegate;
    };
    WebView.prototype.onUnloaded = function () {
        this._ios.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    Object.defineProperty(WebView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    WebView.prototype.stopLoading = function () {
        this._ios.stopLoading();
    };
    WebView.prototype._loadUrl = function (src) {
        this._ios.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(src)));
    };
    WebView.prototype._loadData = function (content) {
        this._ios.loadHTMLStringBaseURL(content, NSURL.alloc().initWithString("file:///" + web_view_common_1.knownFolders.currentApp().path + "/"));
    };
    Object.defineProperty(WebView.prototype, "canGoBack", {
        get: function () {
            return this._ios.canGoBack;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebView.prototype, "canGoForward", {
        get: function () {
            return this._ios.canGoForward;
        },
        enumerable: true,
        configurable: true
    });
    WebView.prototype.goBack = function () {
        this._ios.goBack();
    };
    WebView.prototype.goForward = function () {
        this._ios.goForward();
    };
    WebView.prototype.reload = function () {
        this._ios.reload();
    };
    __decorate([
        profiling_1.profile
    ], WebView.prototype, "onLoaded", null);
    return WebView;
}(web_view_common_1.WebViewBase));
exports.WebView = WebView;
//# sourceMappingURL=web-view.ios.js.map