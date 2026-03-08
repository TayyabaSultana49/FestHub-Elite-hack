import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPj9wj3tbS_t1aZoyo2dY0ZsgITRZFPJ4",
  authDomain: "festhub-d8c19.firebaseapp.com",
  projectId: "festhub-d8c19",
  storageBucket: "festhub-d8c19.firebasestorage.app",
  messagingSenderId: "64357206251",
  appId: "1:64357206251:web:ac2661d6ccd9059b1896ae",
  measurementId: "G-Y20CMQ4DGX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Forms
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const userEmail = document.getElementById("user-email");

// Signup
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = signupForm["signup-email"].value;
    const password = signupForm["signup-password"].value;
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Signup successful!");
        window.location.href = "dashboard.html";
      })
      .catch((err) => alert(err.message));
  });
}

// Login
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Login successful!");
        window.location.href = "dashboard.html";
      })
      .catch((err) => alert(err.message));
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

// Protect dashboard
onAuthStateChanged(auth, (user) => {
  if (userEmail) {
    if (!user) {
      window.location.href = "login.html";
    } else {
      userEmail.textContent = user.email;
    }
  }
});
