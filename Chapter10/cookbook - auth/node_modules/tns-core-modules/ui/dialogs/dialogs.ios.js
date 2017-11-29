function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var dialogs_common_1 = require("./dialogs-common");
var types_1 = require("../../utils/types");
var utils = require("../../utils/utils");
var getter = utils.ios.getter;
__export(require("./dialogs-common"));
var UIAlertViewDelegateImpl = (function (_super) {
    __extends(UIAlertViewDelegateImpl, _super);
    function UIAlertViewDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UIAlertViewDelegateImpl.initWithCallback = function (callback) {
        var delegate = UIAlertViewDelegateImpl.new();
        delegate._callback = callback;
        return delegate;
    };
    UIAlertViewDelegateImpl.prototype.alertViewClickedButtonAtIndex = function (view, index) {
        this._callback(view, index);
    };
    UIAlertViewDelegateImpl.ObjCProtocols = [UIAlertViewDelegate];
    return UIAlertViewDelegateImpl;
}(NSObject));
var UIActionSheetDelegateImpl = (function (_super) {
    __extends(UIActionSheetDelegateImpl, _super);
    function UIActionSheetDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UIActionSheetDelegateImpl.initWithCallback = function (callback) {
        var delegate = UIActionSheetDelegateImpl.new();
        delegate._callback = callback;
        return delegate;
    };
    UIActionSheetDelegateImpl.prototype.actionSheetClickedButtonAtIndex = function (actionSheet, index) {
        this._callback(actionSheet, index);
    };
    UIActionSheetDelegateImpl.ObjCProtocols = [UIActionSheetDelegate];
    return UIActionSheetDelegateImpl;
}(NSObject));
function createUIAlertView(options) {
    var alert = UIAlertView.new();
    alert.title = options && options.title ? options.title : "";
    alert.message = options && options.message ? options.message : "";
    return alert;
}
var allertButtons;
(function (allertButtons) {
    allertButtons[allertButtons["cancel"] = 1] = "cancel";
    allertButtons[allertButtons["neutral"] = 2] = "neutral";
    allertButtons[allertButtons["ok"] = 4] = "ok";
})(allertButtons || (allertButtons = {}));
function addButtonsToAlertDialog(alert, options) {
    if (!options) {
        return;
    }
    if (options.cancelButtonText) {
        alert.tag = allertButtons.cancel;
        alert.addButtonWithTitle(options.cancelButtonText);
    }
    if (options.neutralButtonText) {
        alert.tag = alert.tag | allertButtons.neutral;
        alert.addButtonWithTitle(options.neutralButtonText);
    }
    if (options.okButtonText) {
        alert.tag = alert.tag | allertButtons.ok;
        alert.addButtonWithTitle(options.okButtonText);
    }
}
function getDialogResult(buttons, index) {
    var hasCancel = buttons & allertButtons.cancel;
    var hasNeutral = buttons & allertButtons.neutral;
    var hasOk = buttons & allertButtons.ok;
    if (hasCancel && hasNeutral && hasOk) {
        return index === 0 ? false : index === 2 ? true : undefined;
    }
    else if (buttons & hasNeutral && hasOk) {
        return index === 0 ? undefined : true;
    }
    else if (hasCancel && hasOk) {
        return index !== 0;
    }
    else if (hasCancel && hasNeutral) {
        return index === 0 ? false : undefined;
    }
    else if (hasCancel) {
        return false;
    }
    else if (hasOk) {
        return true;
    }
    return undefined;
}
function addButtonsToAlertController(alertController, options, callback) {
    if (!options) {
        return;
    }
    if (types_1.isString(options.cancelButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, 0, function (arg) {
            raiseCallback(callback, false);
        }));
    }
    if (types_1.isString(options.neutralButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.neutralButtonText, 0, function (arg) {
            raiseCallback(callback, undefined);
        }));
    }
    if (types_1.isString(options.okButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.okButtonText, 0, function (arg) {
            raiseCallback(callback, true);
        }));
    }
}
function raiseCallback(callback, result) {
    if (types_1.isFunction(callback)) {
        callback(result);
    }
}
function alert(arg) {
    return new Promise(function (resolve, reject) {
        try {
            var options = !dialogs_common_1.isDialogOptions(arg) ? { title: dialogs_common_1.ALERT, okButtonText: dialogs_common_1.OK, message: arg + "" } : arg;
            if (utils.ios.MajorVersion < 8) {
                var alert_1 = createUIAlertView(options);
                if (options.okButtonText) {
                    alert_1.addButtonWithTitle(options.okButtonText);
                }
                var delegate_1 = UIAlertViewDelegateImpl.initWithCallback(function (view, index) {
                    resolve();
                    delegate_1 = undefined;
                });
                alert_1.delegate = delegate_1;
                alert_1.show();
            }
            else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 1);
                addButtonsToAlertController(alertController, options, function () { resolve(); });
                showUIAlertController(alertController);
            }
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.alert = alert;
function confirm(arg) {
    return new Promise(function (resolve, reject) {
        try {
            var options = !dialogs_common_1.isDialogOptions(arg) ? { title: dialogs_common_1.CONFIRM, okButtonText: dialogs_common_1.OK, cancelButtonText: dialogs_common_1.CANCEL, message: arg + "" } : arg;
            if (utils.ios.MajorVersion < 8) {
                var alert_2 = createUIAlertView(options);
                addButtonsToAlertDialog(alert_2, options);
                var delegate_2 = UIAlertViewDelegateImpl.initWithCallback(function (view, index) {
                    resolve(getDialogResult(alert_2.tag, index));
                    delegate_2 = undefined;
                });
                alert_2.delegate = delegate_2;
                alert_2.show();
            }
            else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 1);
                addButtonsToAlertController(alertController, options, function (r) { resolve(r); });
                showUIAlertController(alertController);
            }
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.confirm = confirm;
function prompt(arg) {
    var options;
    var defaultOptions = {
        title: dialogs_common_1.PROMPT,
        okButtonText: dialogs_common_1.OK,
        cancelButtonText: dialogs_common_1.CANCEL,
        inputType: dialogs_common_1.inputType.text,
    };
    if (arguments.length === 1) {
        if (types_1.isString(arg)) {
            options = defaultOptions;
            options.message = arg;
        }
        else {
            options = arg;
        }
    }
    else if (arguments.length === 2) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.defaultText = arguments[1];
        }
    }
    return new Promise(function (resolve, reject) {
        try {
            var textField_1;
            if (utils.ios.MajorVersion < 8) {
                var alert_3 = createUIAlertView(options);
                if (options.inputType === dialogs_common_1.inputType.password) {
                    alert_3.alertViewStyle = 1;
                }
                else {
                    alert_3.alertViewStyle = 2;
                }
                addButtonsToAlertDialog(alert_3, options);
                textField_1 = alert_3.textFieldAtIndex(0);
                textField_1.text = types_1.isString(options.defaultText) ? options.defaultText : "";
                if (options.inputType === dialogs_common_1.inputType.email) {
                    textField_1.keyboardType = 7;
                }
                var delegate_3 = UIAlertViewDelegateImpl.initWithCallback(function (view, index) {
                    resolve({ result: getDialogResult(alert_3.tag, index), text: textField_1.text });
                    delegate_3 = undefined;
                });
                alert_3.delegate = delegate_3;
                alert_3.show();
            }
            else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 1);
                alertController.addTextFieldWithConfigurationHandler(function (arg) {
                    arg.text = types_1.isString(options.defaultText) ? options.defaultText : "";
                    arg.secureTextEntry = options && options.inputType === dialogs_common_1.inputType.password;
                    if (options && options.inputType === dialogs_common_1.inputType.email) {
                        arg.keyboardType = 7;
                    }
                    var color = dialogs_common_1.getTextFieldColor();
                    if (color) {
                        arg.textColor = arg.tintColor = color.ios;
                    }
                });
                textField_1 = alertController.textFields.firstObject;
                addButtonsToAlertController(alertController, options, function (r) { resolve({ result: r, text: textField_1.text }); });
                showUIAlertController(alertController);
            }
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.prompt = prompt;
function login(arg) {
    var options;
    var defaultOptions = { title: dialogs_common_1.LOGIN, okButtonText: dialogs_common_1.OK, cancelButtonText: dialogs_common_1.CANCEL };
    if (arguments.length === 1) {
        if (types_1.isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        }
        else {
            options = arguments[0];
        }
    }
    else if (arguments.length === 2) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userName = arguments[1];
        }
    }
    else if (arguments.length === 3) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1]) && types_1.isString(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userName = arguments[1];
            options.password = arguments[2];
        }
    }
    return new Promise(function (resolve, reject) {
        try {
            var userNameTextField_1;
            var passwordTextField_1;
            if (utils.ios.MajorVersion < 8) {
                var alert_4 = createUIAlertView(options);
                alert_4.alertViewStyle = 3;
                addButtonsToAlertDialog(alert_4, options);
                userNameTextField_1 = alert_4.textFieldAtIndex(0);
                userNameTextField_1.text = types_1.isString(options.userName) ? options.userName : "";
                passwordTextField_1 = alert_4.textFieldAtIndex(1);
                passwordTextField_1.text = types_1.isString(options.password) ? options.password : "";
                var delegate_4 = UIAlertViewDelegateImpl.initWithCallback(function (view, index) {
                    resolve({ result: getDialogResult(alert_4.tag, index), userName: userNameTextField_1.text, password: passwordTextField_1.text });
                    delegate_4 = undefined;
                });
                alert_4.delegate = delegate_4;
                alert_4.show();
            }
            else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 1);
                alertController.addTextFieldWithConfigurationHandler(function (arg) {
                    arg.placeholder = "Login";
                    arg.text = types_1.isString(options.userName) ? options.userName : "";
                    var color = dialogs_common_1.getTextFieldColor();
                    if (color) {
                        arg.textColor = arg.tintColor = color.ios;
                    }
                });
                alertController.addTextFieldWithConfigurationHandler(function (arg) {
                    arg.placeholder = "Password";
                    arg.secureTextEntry = true;
                    arg.text = types_1.isString(options.password) ? options.password : "";
                    var color = dialogs_common_1.getTextFieldColor();
                    if (color) {
                        arg.textColor = arg.tintColor = color.ios;
                    }
                });
                userNameTextField_1 = alertController.textFields.firstObject;
                passwordTextField_1 = alertController.textFields.lastObject;
                addButtonsToAlertController(alertController, options, function (r) {
                    resolve({
                        result: r,
                        userName: userNameTextField_1.text,
                        password: passwordTextField_1.text
                    });
                });
                showUIAlertController(alertController);
            }
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.login = login;
function showUIAlertController(alertController) {
    var currentPage = dialogs_common_1.getCurrentPage();
    if (currentPage) {
        var viewController = currentPage.modal ? currentPage.modal.ios : currentPage.ios;
        if (viewController) {
            if (alertController.popoverPresentationController) {
                alertController.popoverPresentationController.sourceView = viewController.view;
                alertController.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
                alertController.popoverPresentationController.permittedArrowDirections = 0;
            }
            var color = dialogs_common_1.getButtonColor();
            if (color) {
                alertController.view.tintColor = color.ios;
            }
            var lblColor = dialogs_common_1.getLabelColor();
            if (lblColor) {
                if (alertController.title) {
                    var title = NSAttributedString.alloc().initWithStringAttributes(alertController.title, (_a = {}, _a[NSForegroundColorAttributeName] = lblColor.ios, _a));
                    alertController.setValueForKey(title, "attributedTitle");
                }
                if (alertController.message) {
                    var message = NSAttributedString.alloc().initWithStringAttributes(alertController.message, (_b = {}, _b[NSForegroundColorAttributeName] = lblColor.ios, _b));
                    alertController.setValueForKey(message, "attributedMessage");
                }
            }
            viewController.presentModalViewControllerAnimated(alertController, true);
        }
    }
    var _a, _b;
}
function action(arg) {
    var options;
    var defaultOptions = { title: null, cancelButtonText: dialogs_common_1.CANCEL };
    if (arguments.length === 1) {
        if (types_1.isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        }
        else {
            options = arguments[0];
        }
    }
    else if (arguments.length === 2) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.cancelButtonText = arguments[1];
        }
    }
    else if (arguments.length === 3) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1]) && types_1.isDefined(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.cancelButtonText = arguments[1];
            options.actions = arguments[2];
        }
    }
    return new Promise(function (resolve, reject) {
        try {
            var i = void 0;
            var action_1;
            if (utils.ios.MajorVersion < 8) {
                var actionSheet = UIActionSheet.new();
                if (types_1.isString(options.message)) {
                    actionSheet.title = options.message;
                }
                if (options.actions) {
                    for (i = 0; i < options.actions.length; i++) {
                        action_1 = options.actions[i];
                        if (types_1.isString(action_1)) {
                            actionSheet.addButtonWithTitle(action_1);
                        }
                    }
                }
                if (types_1.isString(options.cancelButtonText)) {
                    actionSheet.addButtonWithTitle(options.cancelButtonText);
                    actionSheet.cancelButtonIndex = actionSheet.numberOfButtons - 1;
                }
                var delegate_5 = UIActionSheetDelegateImpl.initWithCallback(function (sender, index) {
                    resolve(sender.buttonTitleAtIndex(index));
                    delegate_5 = undefined;
                });
                actionSheet.delegate = delegate_5;
                actionSheet.showInView(getter(UIApplication, UIApplication.sharedApplication).keyWindow);
            }
            else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 0);
                if (options.actions) {
                    for (i = 0; i < options.actions.length; i++) {
                        action_1 = options.actions[i];
                        if (types_1.isString(action_1)) {
                            alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(action_1, 0, function (arg) {
                                resolve(arg.title);
                            }));
                        }
                    }
                }
                if (types_1.isString(options.cancelButtonText)) {
                    alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, 1, function (arg) {
                        resolve(arg.title);
                    }));
                }
                showUIAlertController(alertController);
            }
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.action = action;
//# sourceMappingURL=dialogs.ios.js.map