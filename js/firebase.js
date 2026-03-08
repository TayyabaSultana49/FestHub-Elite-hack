import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

// Load events into a container
export const loadEvents = (containerId, statsId) => {
  const container = document.getElementById(containerId);
  const statsEl = statsId ? document.getElementById(statsId) : null;

  onSnapshot(collection(db, "events"), (snapshot) => {
    container.innerHTML = "";
    let count = 0;

    snapshot.forEach((docSnap) => {
      count++;
      const event = docSnap.data();
      const card = document.createElement("div");
      card.className = "card event-card";
      card.innerHTML = `
        <div>
          <h3>${event.name}</h3>
          <p>${event.description || ""}</p>
          <div class="event-meta">
            <span class="badge">Date: ${event.date || "TBA"}</span>
            <span class="badge">Mode: ${event.mode || "Offline"}</span>
            <span class="badge">Capacity: ${(event.attendees || 0)}/${event.maxAttendees || "∞"}</span>
          </div>
        </div>
        <div>
          <button class="btn" data-id="${docSnap.id}">Join</button>
        </div>
      `;
      container.appendChild(card);
    });

    if (statsEl) {
      statsEl.textContent = count;
    }

    container.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => registerForEvent(btn.dataset.id));
    });
  });
};

export const createEvent = async (formData) => {
  try {
    formData.attendees = 0;
    await addDoc(collection(db, "events"), formData);
    alert("Event created successfully!");
  } catch (err) {
    alert(err.message);
  }
};

export const registerForEvent = async (eventId) => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login first.");
    return;
  }
  try {
    const ref = doc(db, "events", eventId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      alert("Event not found.");
      return;
    }
    const data = snap.data();
    const current = data.attendees || 0;
    const max = data.maxAttendees || Infinity;
    if (current >= max) {
      alert("Event is full.");
      return;
    }
    await updateDoc(ref, { attendees: current + 1 });
    alert("You joined this event!");
  } catch (err) {
    alert(err.message);
  }
};

export const dbRef = db;
export const authRef = auth;
