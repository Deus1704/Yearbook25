// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
// apiKey: "BDQiNddfW0WLgs-L2uIboUJtxi3PKo68BkWVpKf5HgjS9ObESxExjhT7xgDJOh2NINRK5QKI5tWtIxEvMPHmFGY",
// apiKey: process.env.REACT_APP_API_KEY,
apiKey: "AIzaSyDC3RvS5Ubdk2SItIXaCjS3uDx--Exgci8",
authDomain: "yearbook-25.firebaseapp.com",
projectId: "yearbook-25",
storageBucket: "yearbook-25.appspot.com",
messagingSenderId: "359745168319",
// appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };