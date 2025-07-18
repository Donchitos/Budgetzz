// 1. Import Express into our project
const express = require('express');

// 2. Create an instance of an Express application
const app = express();

// 3. Define a "port" for our server to listen on. 5000 is a common choice for development.
const PORT = 5000;

// 4. Create a simple "test route"
// This tells the server what to do when someone visits the address '/api/test'
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the server! Your Budgetzz app is running!' });
});

// 5. Start the server and make it listen for requests on the defined port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});