// Firebase configuration and form handling
// Note: Ensure Realtime Database security rules are configured to protect the 'contacts' path
const firebaseConfig = {
  apiKey: "AIzaSyBeoa1fyu3sDPDNa0G4z_TiJEdTKDxiOcU",
  authDomain: "fart-bf39f.firebaseapp.com",
  databaseURL: "https://fart-bf39f-default-rtdb.firebaseio.com",
  projectId: "fart-bf39f",
  storageBucket: "fart-bf39f.firebasestorage.app",
  messagingSenderId: "64630883432",
  appId: "1:64630883432:web:642e09d25e787d4002a7dd",
  measurementId: "G-KR9NCZMX1Y"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = firebase.database();

// Initialize Analytics (optional)
if (typeof firebase.analytics === 'function') {
  firebase.analytics();
}

// Simple email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Handle contact form submission
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitButton = contactForm.querySelector('input[type="submit"]');
      const originalValue = submitButton.value;
      
      // Get form data
      const name = contactForm.querySelector('input[name="name"]').value.trim();
      const email = contactForm.querySelector('input[name="email"]').value.trim();
      const message = contactForm.querySelector('textarea[name="message"]').value.trim();
      
      // Validate form fields
      if (!name || !email || !message) {
        submitButton.value = 'Please fill all fields';
        setTimeout(() => {
          submitButton.value = originalValue;
        }, 2000);
        return;
      }
      
      if (!isValidEmail(email)) {
        submitButton.value = 'Please enter valid email';
        setTimeout(() => {
          submitButton.value = originalValue;
        }, 2000);
        return;
      }
      
      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.value = 'Sending...';
      
      try {
        // Add data to Realtime Database
        await db.ref('contacts').push({
          name: name,
          email: email,
          message: message,
          timestamp: Date.now()
        });
        
        // Success - reset form and show success message
        contactForm.reset();
        submitButton.value = 'Message Sent!';
        
        // Reset button text after 3 seconds
        setTimeout(() => {
          submitButton.value = originalValue;
          submitButton.disabled = false;
        }, 3000);
        
      } catch (error) {
        console.error('Error submitting form:', error);
        submitButton.value = 'Error - Try Again';
        submitButton.disabled = false;
        
        // Reset button text after 3 seconds
        setTimeout(() => {
          submitButton.value = originalValue;
        }, 3000);
      }
    });
  }
});
