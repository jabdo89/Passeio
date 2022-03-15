const functions = require('firebase-functions');
const axios = require('axios');

const admin = require('firebase-admin');

admin.initializeApp();

const { searchAmazon, AmazonSearchResult } = require('unofficial-amazon-search');

const { Stripe } = require('stripe');

const stripe = Stripe(
  'sk_test_51JjxhaFmg0ieCuj1gsYcE9Iiq4d4aXSVX1K9Er1TGQyLZLxy9QJ3RrdXS9tNVCPGbUlTO6Pb9ib2SCQewCSxq1Rg00VmET8iJx'
);

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

exports.urlProducts = functions.https.onCall((search) => {
  const params = {
    api_key: '458F1E4E1EE645B19FFBC8CC7DDAE150',
    type: 'product',
    url: search,
  };
  return new Promise((resolve, reject) => {
    axios
      .get('https://api.rainforestapi.com/request', { params })
      .then((response) => {
        // print the JSON response from Rainforest API
        resolve(response.data);
        return response.data;
      })
      .catch((error) => {
        // catch and print the error
        reject(new Error(`Error: something goes wrong ! ${error}`));
      });
  });
});

function reportError(err, context = {}) {
  // This is the name of the StackDriver log stream that will receive the log
  // entry. This name can be any valid log stream name, but must contain "err"
  // in order for the error to be picked up by StackDriver Error Reporting.
  const log = null;

  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  const metadata = {
    resource: {
      type: 'cloud_function',
      labels: { function_name: process.env.FUNCTION_NAME },
    },
  };

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const errorEvent = {
    message: err.stack,
    serviceContext: {
      service: process.env.FUNCTION_NAME,
      resourceType: 'cloud_function',
    },
    context,
  };
  return new Promise((resolve, reject) => {
    log.write(log.entry(metadata, errorEvent), (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

function userFacingMessage(error) {
  return error.type ? error.message : 'An error occurred, developers have been alerted';
}

exports.createStripePayment = functions.firestore
  .document('Payments/{userId}')
  .onCreate(async (snap, context) => {
    // eslint-disable-next-line camelcase
    const { amount, currency, payment_method } = snap.data();
    try {
      // Look up the Stripe customer id.
      const customer = (await snap.ref.parent.parent.get()).data().customer_id;
      // Create a charge using the pushId as the idempotency key
      // to protect against double charges.
      const idempotencyKey = context.params.pushId;
      const payment = await stripe.paymentIntents.create(
        {
          amount,
          currency,
          customer,
          payment_method,
          off_session: false,
          confirm: true,
          confirmation_method: 'manual',
        },
        { idempotencyKey }
      );
      // If the result is successful, write it back to the database.
      await snap.ref.set(payment);
    } catch (error) {
      // We want to capture errors and render them in a user-friendly way, while
      // still logging an exception with StackDriver
      functions.logger.log(error);
      await snap.ref.set({ error: userFacingMessage(error) }, { merge: true });
      await reportError(error, { user: context.params.userId });
    }
  });

exports.createStripeCustomer = functions.auth.user().onCreate(async (user) => {
  const customer = await stripe.customers.create({ email: user.email });
  const intent = await stripe.setupIntents.create({
    customer: customer.id,
  });
  await admin.firestore().collection('Users').doc(user.uid).update({
    customer_id: customer.id,
    setup_secret: intent.client_secret,
  });
});

exports.addPaymentMethod = functions.https.onCall((data) => {
  return new Promise((resolve, reject) => {
    functions.logger.log('error', parseInt(data.card.expiry.substring(0, 2)));
    stripe.paymentMethods
      .create({
        type: 'card',
        card: {
          number: data.card.number,
          exp_month: parseInt(data.card.expiry.substring(0, 2)),
          // eslint-disable-next-line radix
          exp_year: 2000 + parseInt(data.card.expiry.substring(3, 5)),
          cvc: data.card.cvc,
        },
        billing_details: {
          name: data.card.name,
          email: data.customer.email,
        },
      })
      .then((info) => {
        stripe.paymentMethods
          .attach(info.id, { customer: data.customer.customer_id })
          .then((result) => {
            functions.logger.log('Succes', result);
            resolve({ status: 'Success', result });
            return 'Success';
          })
          .catch((error) => {
            functions.logger.log('error', error);
            functions.logger.log('error', error.Error);
            functions.logger.log('error', new Error(error));
            resolve({ status: 'Error', result: error });
          });
      })
      .catch((error) => {
        functions.logger.log('error', error);
        resolve({ status: 'Error', result: error });
      });
  });
});

exports.chargeStripe = functions.https.onCall((data) => {
  return new Promise((resolve, reject) => {
    stripe.paymentIntents
      .create({
        // eslint-disable-next-line radix
        amount: parseInt(String(data.info.total.total).replace('.', '')),
        currency: 'usd',
        customer: data.user.customer_id,
        payment_method: data.source.id,
        description: data.info.id,
      })
      .then((result) => {
        resolve({ status: 'Success', result });
      })
      .catch((error) => {
        functions.logger.log('error', error);
        resolve({ status: 'Error', result: new Error(error) });
      });
  });
});
