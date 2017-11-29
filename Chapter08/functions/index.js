/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for t`he specific language governing permissions and
 * limitations under the License.
 */
'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const rp = require('request-promise');
const promisePool = require('es6-promise-pool');
const PromisePool = promisePool.PromisePool;
// Maximum concurrent account deletions.
const MAX_CONCURRENT = 3;


exports.updateStats = functions.database.ref('/purchases/{pushId}/item').onWrite(event => {
  const addedPurchases = event.data.val();
  const uppercase = `${addedPurchases.name.toUpperCase()} - is a ${addedPurchases.type} - is PENDING`
  console.log(uppercase);
  return event.data.ref.parent.child('status').set(uppercase);
});

/**
 * Recipe N = 1
 */
function getUsers(userIds = [], nextPageToken, accessToken) {
  return getAccessToken(accessToken).then(accessToken => {
    const options = {
      method: 'POST',
      uri: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/downloadAccount?fields=users/localId,users/lastLoginAt,nextPageToken&access_token=' + accessToken,
      body: {
        nextPageToken: nextPageToken,
        maxResults: 1000
      },
      json: true
    };

    return rp(options).then(resp => {
      if (!resp.users) {
        return userIds;
      }
      if (resp.nextPageToken) {
        return getUsers(userIds.concat(resp.users), resp.nextPageToken, accessToken);
      }
      return userIds.concat(resp.users);
    });
  });
}

/**
 * Recipe N = 2
 */
exports.updateStats = functions.database.ref('/path/to/data').onWrite(event => {
  const data = event.data;
  const anotherData = data.child('childPath');
  if (anotherData.changed()) {
    //TODO: implement notification 
  } else {
    //return promise.
  }
});

/**
 * Recipe N = 3
 */
exports.sendEmailUponAccountCreation = functions.auth.user().onCreate(ev => {
  //Getting the new User account informations.
  const newUser = ev.data;
  const email = newUser.email;
  const fullName = newUser.displayName;
  //TODO : Send Email from here
});

/**
 * Recipe N = 4
 */
exports.sendEmailWhenSubscribe = functions.database.ref('/bookevent').onWrite(ev => {
  //getting the event data.
  const userMeta = ev.data;
  const email = userMeta.email;
  const displayName = user.displayName;
  switch (ev.eventType) {
    case "providers/firebase.auth/eventTypes/user.create":
      //TODO Send confirmation email from here
      break;
    case "providers/firebase.auth/eventTypes/user.delete":
      //TODO Send Goodbye email from here
      break;
  }
})

/**
 * Recipe N = 5
 */
exports.emailNotifier = functions.https.onRequest((req, res) => {
  // Fetch all user details.
  getUsers().then(users => {
    // Find users that have not signed in in the last 1 weeke.
    const notifiedUsers = users.filter(
      user => parseInt(user.lastLoginAt, 10) < Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    // Use a pool so that we delete maximum `MAX_CONCURRENT` users in parallel.
    const promisePool = new PromisePool(() => {
      if (notifiedUsers.length > 0) {
        const userToNotifiy = notifiedUsers.pop();
        //Get the user metadata
        admin
          .auth()
          .getUser(userToNotifiy.localId)
          .then(user => {
            // TODO: Send email from here
          })
          .catch(function (error) {
            console.log('[*] Error fetching user data:', error);
          });
      }
    }, MAX_CONCURRENT);
    promisePool.start().then(() => {
      res.send('[*] Successfully contacted all inactive users');
    });
  });
});

function getAccessToken(accessToken) {
  // If we have an accessToken in cache to re-use we pass it directly.
  if (accessToken) {
    return Promise.resolve(accessToken);
  }
  const options = {
    uri: 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    headers: {
      'Metadata-Flavor': 'Google'
    },
    json: true
  };

  return rp(options).then(resp => resp.access_token);
}