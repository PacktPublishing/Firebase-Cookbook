var Observable = require("data/observable").Observable;
var firebase = require("nativescript-plugin-firebase");

function createViewModel() {
  var viewModel = new Observable();

  firebase.getRemoteConfig({
    developerMode: false, // play with this boolean to get more frequent updates during development
    cacheExpirationSeconds: 1, // 10 minutes, default is 12 hours.. set to a lower value during dev
    properties: [{
      key: "ramadan_promo_enabled",
      default: false
    }]
  }).then(
      function (result) {
        console.log(JSON.stringify(result));
        console.log("Remote Config last fetched at " + result.lastFetch);
        console.log("Remote Config: " + JSON.stringify(result.properties));
      }
  );

  var onChildEvent = function(result) {
    console.log("Event type: " + result.type);
    console.log("Key: " + result.key);
    console.log("Value: " + JSON.stringify(result.value));
  };
  firebase.addChildEventListener(onChildEvent, "/ideas").then((snapshot) => {
        console.log("firebase.addChildEventListener added");
  });
  viewModel.anonLogin = () => {
    console.log("will make anon login");
    firebase.login({
      type: firebase.LoginType.ANONYMOUS
    }).then(
      function (result) {
        console.log(JSON.stringify(result));
      },
      function (errorMessage) {
        console.log(errorMessage);
      }
    );
  }

  viewModel.passLogin = () => {
    firebase.login({
      type: firebase.LoginType.GOOGLE,
    }).then(
        function (result) {
          console.log("got response");
          console.log(JSON.stringify(result));
        },
        function (errorMessage) {
          console.log(errorMessage);
        }
    );
  
  }
  return viewModel;
}

exports.createViewModel = createViewModel;