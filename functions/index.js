const functions = require('firebase-functions');

const { searchAmazon, AmazonSearchResult } = require('unofficial-amazon-search');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.listProducts = functions.https.onCall((search) => {
  functions.logger.log('info', search);
  return new Promise((resolve, reject) => {
    searchAmazon(search)
      .then((data) => {
        functions.logger.log('info', data);
        resolve(data.searchResults);
        return data.searchResults;
      })
      .catch((err) => {
        reject(new Error(`Error: something goes wrong ! ${err}`));
      });
  });
});
