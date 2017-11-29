var Observable = require("data/observable").Observable;
var firebase = require("nativescript-plugin-firebase");

function createViewModel() {
  var viewModel = new Observable();

  firebase.getRemoteConfig({
    developerMode: true, // play with this boolean to get more frequent updates during development
    cacheExpirationSeconds: 1, // 10 minutes, default is 12 hours.. set to a lower value during dev
    properties: [{
      key: "ramadan_promo_enabled",
      default: false
    }]
  }).then(
      function (result) {
        console.log(JSON.stringify(result));
        console.log("Remote Config last fetched at " + result.lastFetch);
        console.log("Remote Config: " + JSON.stringify(result.properties.ramadan_promo_enabled));
      }
  );
  return viewModel;
}

exports.createViewModel = createViewModel;