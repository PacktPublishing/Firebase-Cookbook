var Observable = require("data/observable").Observable;
var firebase = require("nativescript-plugin-firebase");

function createViewModel() {
    var viewModel = new Observable();
    
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
    
  return viewModel;
}

exports.createViewModel = createViewModel;