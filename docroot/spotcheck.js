window.onload = function() {
    let username = localStorage.getItem("user");
    if(username) {
        userEl = document.getElementById("currentUser");
        userEl.innerText = username;

        loginEl = document.getElementById("login");
        loginEl.onclick = logout;
        loginEl.innerText = "Logout";
    }
}

function logout() {
    userEl = document.getElementById("currentUser");
    userEl.innerText = "";

    loginEl = document.getElementById("login");
    loginEl.innerText = "Login";

    localStorage.removeItem("user");
}

function flashBtn(el) {
    el.classList.add("failed");
    setTimeout(() => {
        el.classList.remove("failed");
    }, 2000);

    return false;
}

//Simulate websocket
function addConsole(msg) {
    let console = document.getElementById("console");
    if(console) {
        let text = document.createElement("p");
        text.innerText = msg;

        console.appendChild(text);

        setTimeout(() => {
            console.removeChild(text);
        }, 3000);
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

let consoleMsgs = [
    "Winning the lottery",
    "Taking out the trash",
    "Making dinner plans",
    "Socketing the webs",
    "Building an empire",
    "Checking my spots",
    "Taking a snack break",
    "Waiting for pigs to fly"
];

function genConsole() {
    let msgInd = randInt(0, consoleMsgs.length - 1);
    addConsole(consoleMsgs[msgInd])
}

function setNotification(numReleases) {
    let notify = document.getElementById("notify");
    notify.innerText = numReleases;
}

let totalReleases = 0;
function genNotification() {
    totalReleases += randInt(0, 3);
    setNotification(totalReleases);
}

function genWebsocket() {
    let timing = randInt(2000, 10000);
    setTimeout(() => {
        genConsole();
        genNotification();

        genWebsocket();
    }, timing);
}

genWebsocket();
