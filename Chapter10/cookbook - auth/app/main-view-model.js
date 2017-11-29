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

  viewModel.passLogin = () => {
		let email = viewModel.user_email;
		let pass = viewModel.user_password;
		firebase
			.login({ type: firebase.LoginType.PASSWORD, passwordOptions: { email: email, password: pass } })
			.then(result => {
					console.log('[*] Email/Pass Response : ' + JSON.stringify(result));
				}, error => {
					console.log('[*] Email/Pass Error : ' + error);
				});
	};

  viewModel.googleLogin = () => {
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