// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
// // apiKey: "BDQiNddfW0WLgs-L2uIboUJtxi3PKo68BkWVpKf5HgjS9ObESxExjhT7xgDJOh2NINRK5QKI5tWtIxEvMPHmFGY",
// // apiKey: process.env.REACT_APP_API_KEY,
// apiKey: "AIzaSyDC3RvS5Ubdk2SItIXaCjS3uDx--Exgci8",
// authDomain: "yearbook-25.firebaseapp.com",
// projectId: "yearbook-25",
// storageBucket: "yearbook-25.appspot.com",
// messagingSenderId: "359745168319",
// // appId: "YOUR_APP_ID"
// };

const firebaseConfig = {
    apiKey: "AIzaSyCUwdy0KDHY-oUNi7I-wc7aM2OZqU7FgGk",
    authDomain: "colwebcomp.firebaseapp.com",
    projectId: "colwebcomp",
    storageBucket: "colwebcomp.firebasestorage.app",
    messagingSenderId: "944004021010",
    appId: "1:944004021010:web:a21a948299c680664c51cb",
    measurementId: "G-RPT8393DH8"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };