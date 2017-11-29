const app = require('express')();
var admin = require('firebase-admin');
const bodyParser = require('body-parser');
var serviceAccount = require('./fir-cookbook-firebase-adminsdk-w26ay-c810ab0a75.json');

//Firebse Admin Configuration
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://fir-cookbook.firebaseio.com'
});
//Confguring Body Parser.
app.use(bodyParser.json());

// Routes :

//Recipe : 1 - A
app.post('/users/search/email', (req, res) => {
	let email = req.body.email;
	admin
		.auth()
		.getUserByEmail(email)
		.then(users => {
			//[*] TODO: properly the User.
		})
		.catch(err => {
			logger.error(`[*] Huston we've an error: Error over        
            getting users by email, with error: ${error}`);
			res.json({
				message: `External Error: getting user by email, error       
               : ${error}`
			});
		});
});

//Recipe 1 - B :
app.post('/users/search/phone', (req, res) => {
	let phoneNumber = req.body.phone;
	admin
		.auth()
		.getUserByPhoneNumber(phoneNumber)
		.then(users => {
			//[*] TODO: properly the User.
		})
		.catch(err => {
			logger.error(`[*] Huston we've an error: Error over       
          getting users by phone number, with error: ${err}`);
			res.json({
				message: `External Error: getting user by phone number,     
            error :   ${err}`
			});
		});
});

//Recipe 1 - C :
app.post('/create/users', (req, res) => {
	let { email, password, fullName, image } = req.body;
	admin
		.auth()
		.createUser({
			email: email,
			password: password, //Must be at least six characters long
			displayName: fullName,
			photoURL: image
		})
		.then(user => {
			//[*] Do something within the response !
		})
		.catch(err => {
			logger.error(`External Error: While creating new account,            
              with error : ${err}`);
			res.json({
				message: `Error: while creating new account, with
                  error: ${err}`
			});
		});
});

//Recipe 1 - D :
app.post('/users/:uid/delete', (req, res) => {
	admin
		.auth()
		.deleteUser(req.params.uid)
		.then(() => {
			//[*] Response is empty if everything went OK !
		})
		.catch(err => {
			logger.error(`External Error: While deleting user                       
             account, with ${req.params.uid}, & with error : ${err}`);
			res.json({
				message: `Error: while deleting your account, with                                     
                  error: ${err}`
			});
		});
});

//Recipe 2 : 
app.post('/urgent/policy', (req, res) => {
	let registrationTokens = [];
	//[*] TODO : Grab the registration_ids from secure place.
	let payload = {
		notification: {
			title: 'Policy changes!',
			body: 'Please verify your account, our policy is changing'
		}
	};
	admin
		.messaging()
		.sendToDevice(registrationTokens, payload)
		.then(resp => {
			//[*] Properly handle the response
		})
		.catch(err => {
			logger.error(`External Error: While sending policy push 
            notification, with error : ${err}`);
			res.json({
				message: `Error: while deleting your account, with error:                
            ${err}`
			});
		});
});

app.listen(4000, () => {
    console.log("Listening on port 4000");
})