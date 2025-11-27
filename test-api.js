// Test de connexion API simple
console.log('Testing API connection...');

// Test fetch basique
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@opuslab.com',
    password: 'Admin123!@#'
  })
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Login successful:', data);
})
.catch(error => {
  console.error('Network error:', error);
});