//
//  ViewController.swift
//  admob
//
//  Created by Macbook on 11/21/17.
//  Copyright © 2017 houssem. All rights reserved.
//

import UIKit
import Firebase
import GoogleMobileAds


class ViewController: UIViewController {

    @IBOutlet weak var bannerAdView: GADBannerView!
    override func viewDidLoad() {
        super.viewDidLoad()
        bannerAdView.adUnitID = "ca-app-pub-3940256099942544/2934735716"
        bannerAdView.rootViewController = self
        let request = GADRequest()
        bannerAdView.load(request)
    }


    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

