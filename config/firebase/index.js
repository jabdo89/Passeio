import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAnDgEfajFNshM0yujLQNGP26LUtoC1W5Y',
  authDomain: 'passeio-db887.firebaseapp.com',
  projectId: 'passeio-db887',
  databaseURL: 'https://passeio-db887-default-rtdb.firebaseio.com',
  storageBucket: 'passeio-db887.appspot.com',
  messagingSenderId: '879023302733',
  appId: '1:879023302733:web:3a82b093cb323caca2d404',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const { auth, firestore: db } = firebase;

export { auth, db };
