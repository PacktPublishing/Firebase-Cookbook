require("./bundle-config");
var application = require("application");
var firebase = require("nativescript-plugin-firebase");

firebase.init({}).then((instance) => {
  console.log("firebase.init done");
}, (error) => {
  console.log("firebase.init error: " + error);
});

application.start({
  moduleName: "main-page"
});