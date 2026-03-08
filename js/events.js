import { loadEvents, createEvent } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const eventsContainer = document.getElementById("events-container");
  if (eventsContainer) {
    loadEvents("events-container", "total-events");
  }

  const createForm = document.getElementById("create-event-form");
  if (createForm) {
    createForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(createForm).entries());
      createEvent(formData);
      createForm.reset();
    });
  }
});
