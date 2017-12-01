//
//  ViewController.swift
//  firebaseui
//
//  Created by Macbook on 10/14/17.
//  Copyright © 2017 houssem. All rights reserved.
//

import UIKit
import Firebase
import FBSDKLoginKit
import FirebaseAuth
import GoogleSignIn

class ViewController: UIViewController, FBSDKLoginButtonDelegate, GIDSignInUIDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        //Default values Dict
        let defaultConfigs = [
            "supportGoogleLogin" : true
        ]
        
        RemoteConfig.remoteConfig().setDefaults(defaultConfigs as [String : NSObject])
        let developerSettings = RemoteConfigSettings(developerModeEnabled: true) // This should be remove while going to prod.
        RemoteConfig.remoteConfig().configSettings = developerSettings!
        RemoteConfig.remoteConfig().fetch(withExpirationDuration: 0, completionHandler: {[unowned self] (status, error) in
            if let error = error {
                print("Huston we've a problem : \(error)")
                return
            }
            print("Huston , al Google 👍")
            RemoteConfig.remoteConfig().activateFetched()
            self.checkLoginButtonPresence()
        })
    }
    func checkLoginButtonPresence() {
        let supportGoogleLogin = RemoteConfig.remoteConfig().configValue(forKey: "supportGoogleLogin").boolValue
        if(supportGoogleLogin) {
            let loginButton = FBSDKLoginButton()
            loginButton.frame = CGRect(x: 16, y: 50, width: view.frame.width - 32, height: 50)
            view.addSubview(loginButton)
            loginButton.delegate = self
            
            //Google sign in
            let googleBtn = GIDSignInButton()
            googleBtn.frame =  CGRect(x: 16, y: 111, width: view.frame.width - 32, height: 50)
            view.addSubview(googleBtn)
            GIDSignIn.sharedInstance().uiDelegate = self
            
        } else {
            let loginButton = FBSDKLoginButton()
            loginButton.frame = CGRect(x: 16, y: 50, width: view.frame.width - 32, height: 50)
            view.addSubview(loginButton)
            loginButton.delegate = self
        }
    }
    
    func loginButton(_ loginButton: FBSDKLoginButton!, didCompleteWith result: FBSDKLoginManagerLoginResult!, error: Error!) {
        if let error = error {
            print(error.localizedDescription)
            return
        }
        print("logging in ..")
        let credential = FacebookAuthProvider.credential(withAccessToken: FBSDKAccessToken.current().tokenString)
        Auth.auth().signIn(with: credential) { (user, error) in
            if let error = error {
                print(error.localizedDescription)
                return
            }
            let alert = UIAlertController(title: "Logged in !", message: user?.displayName as String?, preferredStyle: UIAlertControllerStyle.alert)
            alert.addAction(UIAlertAction(title: "Click", style: UIAlertActionStyle.default, handler: nil))
            self.present(alert, animated: true, completion: nil)
        }

    }
    
    func loginButtonDidLogOut(_ loginButton: FBSDKLoginButton!) {
        print("logging out ..")
    }
}

