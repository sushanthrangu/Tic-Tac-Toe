const express = require('express');
const path = require('path');
const app = express();
const port = 3000;



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`3D Tic-Tac-Toe app running at http://localhost:${port}`);
});