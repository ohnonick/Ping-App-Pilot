const express = require('express')
const app = express()

const path = require('path');
const fs = require('fs'); // Filesystem

app.use(express.json()); // To parse JSON body for putToken
const PORT = process.env.PORT || 3000;

let connectedBrowsers = [];

//#region Path Details
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const TOKEN_FILE = path.join(__dirname, 'token.json'); // const label
//#endregion

//#region Application Logic
/**
 * putToken() server-side response.
 */
app.post('/token', (req, res) => {
    const { user, browser } = req.body;
    const newToken = { user, browser };

    if(connectedBrowsers.findIndex(b => b.user === user && b.browser === browser) === -1
        && connectedBrowsers.length < 2){
        connectedBrowsers.push(newToken);
        console.log(`New browser connected: ${user} (${browser})`);
    } else if (connectedBrowsers.findIndex(b => b.user === user && b.browser === browser) === -1
        && connectedBrowsers.length >= 2){
        res.json({ success: false });
        console.log("Maximum number of connected browsers reached.");
        return;
    }

    fs.writeFileSync(TOKEN_FILE, JSON.stringify(req.body));
    res.json({ success: true });
});

/**
 * getToken() server-side response.
 */
app.get('/token', (req, res) => {
    if (connectedBrowsers.length <2) {
        res.json(null);
        return;
    }
    try {
        const token = JSON.parse(fs.readFileSync(TOKEN_FILE));
        res.json(token);
    } catch (error) {
        res.json(null);
    }
});
//#endregion

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}! Hello!`);
});