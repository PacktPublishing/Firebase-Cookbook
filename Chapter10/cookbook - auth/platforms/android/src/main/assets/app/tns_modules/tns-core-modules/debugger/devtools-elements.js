Object.defineProperty(exports, "__esModule", { value: true });
var properties_1 = require("../ui/core/properties");
var frame_1 = require("../ui/frame");
var dom_node_1 = require("./dom-node");
function getViewById(nodeId) {
    var node = dom_node_1.getNodeById(nodeId);
    var view;
    if (node) {
        view = node.viewRef.get();
    }
    return view;
}
function attachInspectorCallbacks(inspector) {
    inspector.getDocument = function () {
        var topMostFrame = frame_1.topmost();
        topMostFrame.ensureDomNode();
        return topMostFrame.domNode.toJSON();
    };
    inspector.getComputedStylesForNode = function (nodeId) {
        var view = getViewById(nodeId);
        if (view) {
            return JSON.stringify(view.domNode.getComputedProperties());
        }
        return "[]";
    };
    inspector.removeNode = function (nodeId) {
        var view = getViewById(nodeId);
        if (view) {
            var parent_1 = view.parent;
            if (parent_1.removeChild) {
                parent_1.removeChild(view);
            }
            else if (parent_1.content === view) {
                parent_1.content = null;
            }
            else {
                console.log("Can't remove child from " + parent_1);
            }
        }
    };
    inspector.setAttributeAsText = function (nodeId, text, name) {
        var view = getViewById(nodeId);
        if (view) {
            var hasOriginalAttribute = !!name.trim();
            if (text) {
                var textParts = text.split("=");
                if (textParts.length === 2) {
                    var attrName = textParts[0];
                    var attrValue = textParts[1].replace(/['"]+/g, '');
                    if (name !== attrName && hasOriginalAttribute) {
                        view[name] = properties_1.unsetValue;
                        view[attrName] = attrValue;
                    }
                    else {
                        view[hasOriginalAttribute ? name : attrName] = attrValue;
                    }
                }
            }
            else {
                view[name] = properties_1.unsetValue;
            }
            view.domNode.loadAttributes();
        }
    };
}
exports.attachInspectorCallbacks = attachInspectorCallbacks;
if (global && global.__inspector) {
    attachInspectorCallbacks(global.__inspector);
}
//# sourceMappingURL=devtools-elements.js.map