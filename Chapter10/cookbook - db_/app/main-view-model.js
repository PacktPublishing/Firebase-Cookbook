var Observable = require("data/observable").Observable;
var firebase = require("nativescript-plugin-firebase");

function createViewModel() {
  var viewModel = new Observable();


  viewModel.addToMyBucket = () => {
    firebase.push('/purchases', {
      item: {
        name: viewModel.newIdea,
        type: "PHONE"
      }
    }).then((result) => {
      console.log("[*] Info : Your data was pushed !");
    }, (error) => {
      console.log("[hi *] Error : While pushing your data to Firebase, with error: " + error);
    });
  }

  var onChildEvent = function (result) {
    console.log("Event type: " + result.type);
    console.log("Key: " + result.key);
    console.log("Value: " + JSON.stringify(result.value));
  };
  firebase.addChildEventListener(onChildEvent, "/ideas").then((snapshot) => {
    console.log("firebase.addChildEventListener added");
  });
  return viewModel;
}

exports.createViewModel = createViewModel;