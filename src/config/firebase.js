import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_AUTH_DOMAIN,
  REACT_APP_PROJECT_ID,
  REACT_APP_STORAGE_BUCKET,
  REACT_APP_MESSAGING_SENDER_ID,
  REACT_APP_APP_ID,
  REACT_APP_MEASUREMENT_ID,
} = process.env

const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: REACT_APP_AUTH_DOMAIN,
  projectId: REACT_APP_PROJECT_ID,
  storageBucket: REACT_APP_STORAGE_BUCKET,
  messagingSenderId: REACT_APP_MESSAGING_SENDER_ID,
  appId: REACT_APP_APP_ID,
  measurementId: REACT_APP_MEASUREMENT_ID,
}

firebase.initializeApp(firebaseConfig)
// this is added for the performace testing
firebase.firestore().settings({ experimentalForceLongPolling: true })

const auth = firebase.auth()
const db = firebase.firestore()
const storage = firebase.storage()
const storageRef = storage.ref()
const timestamp = firebase.firestore.FieldValue.serverTimestamp
const FieldValue = firebase.firestore.FieldValue
const timestampNow = firebase.firestore.Timestamp.now

export {
  auth,
  db,
  firebase,
  storage,
  storageRef,
  timestamp,
  FieldValue,
  timestampNow,
}
