//#region Global Variables

/**
 * @typedef Token
 * @type {object}
 * @property {string} user - Generated username.
 * @property {string} browser - User's browser.
 */

/**
 * User on browser's token.
 * @type {Token}
 */
let personalToken = null;

/**
 * Last player's token.
 * @type {Token}
 */
let lastPlayerToken = null;

/**
 * Opponent's token.
 * @type {Token}
 */
let otherPlayerToken = null;

/**
 * Interval ID for polling the server.
 * @type {int}
 */
let pollIntervalId = null;

/**
 * Message printed to user.
 * @type {paragraph}
 */
var messageElement = null;

/**
 * Button used to send a ping.
 * @type {button}
 */
var pingButton = null;

//#endregion

//#region Given

/**
 * Given function from assignment instructions that assigns browser.
 * @function getBrowserName
 * @returns {string} - Browser name.
 */
function getBrowserName() {
    const a = navigator.userAgent;
    let agent = "Firefox";
    if (a.indexOf("Safari") > 0 && a.indexOf("Chrome") === -1) agent = "Safari";
    if (a.indexOf("Chrome") > 0) agent = "Chrome";
    if (a.indexOf("OPR") > 0) agent = "Opera";
    return agent;
}

//#endregion

//#region Assignment Requirements

/**
 * Creates {user, browser} token on Client.
 * @function setToken
 * @param {string} name - Generated UserID.
 * @returns {object} - {username, browser name}
 */
function setToken(name) {
    const browserName = getBrowserName();
    personalToken = { user: name, browser: browserName };
    return personalToken;
}

/**
 * Writes a token from Client as a JSON file on the Server.
 * @function putToken
 * @param {object} token - {username, browser name}
 * @returns {boolean} - Success.
 */
async function putToken(token) {
    const response = await fetch('/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token)
    });
    const result = await response.json();
    return result.success;
}

/**
 * Receives a JSON file from Server and creates a token on Client.
 * @function getToken
 * @returns {object} - {username, browser name}
 */
async function getToken() {
    const response = await fetch('/token');
    return await response.json();
}

//#endregion

//#region Ping

/**
 * Registers user in server.
 * @function initializeGame
 */
async function initializeGame() {
    // Generate username.
    const username = `funnyGuy${Math.floor(Math.random()*9999)}`;
    document.getElementById("username").textContent = `Hello ${username}!`;

    // Create token.
    personalToken = setToken(username);

    // Send token to server
    let success = await putToken(personalToken);
    if (!success) {
        messageElement.textContent = "Failed to connect. Try refreshing the page.";
        pingButton.disabled = true;
        return;
    }

    // Only start polling if user was successfully connected.
    startPolling();
}

/**
 * Sends a ping to the server.
 * @function sendPing
 */
async function sendPing() {
    pingButton.disabled = true;
    messageElement.textContent = "Sending ping...";

    putToken(personalToken);
    messageElement.textContent = "Ping sent! Waiting for response...";
}

/**
 * Polls the server for the last player who sent a ping.
 * @function pollServerState
 */
async function pollServerState() {
    var lastPinger = await getToken();

    pingButton.disabled = true;
    
    if (lastPinger === null) {
        messageElement.textContent = "Waiting for another player...";
    } else if (lastPinger.user !== personalToken.user || lastPinger.browser !== personalToken.browser) {
        lastPlayerToken = { user: lastPinger.user, browser: lastPinger.browser };
        pingButton.disabled = false;
        messageElement.textContent = "It's your turn! Click Ping.";
    } else {
        messageElement.textContent = `Waiting for ${lastPlayerToken.user} (${lastPlayerToken.browser}) turn...`;
        pingButton.disabled = true;
    }
}

//#endregion

//#region Initialization
/** Starts polling the server for updates.
 * @function startPolling
 */
function startPolling() {
    if (pollIntervalId) clearInterval(pollIntervalId); // Clear any existing interval
    pollIntervalId = setInterval(pollServerState, 1000); // Poll every second
    console.log("Polling started.");
}

document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
    
    messageElement = document.getElementById("message");
    pingButton = document.getElementById("pingButton");
    pingButton.addEventListener("click", sendPing);
});

//#endregion