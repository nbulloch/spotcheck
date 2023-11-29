window.onload = function() {
    let username = localStorage.getItem('user');
    if(username) {
        userEl = document.getElementById('currentUser');
        userEl.innerText = username;

        loginEl = document.getElementById('login');
        loginEl.onclick = logout;
        loginEl.innerText = 'Logout';
    }
}

function bearer() {
    const token = localStorage.getItem('token');

    if(!token)
        return null;

    return {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    };
}

function logout() {
    userEl = document.getElementById("currentUser");
    userEl.innerText = "";

    loginEl = document.getElementById("login");
    loginEl.innerText = "Login";

    const auth = bearer();
    if(auth) {
        fetch('/api/login', { method: "DELETE", headers: auth });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }
}

function flashBtn(el) {
    el.classList.add("failed");
    setTimeout(() => {
        el.classList.remove("failed");
    }, 2000);

    return false;
}

const protocol = window.location.protocol == 'https:' ? 'wss:' : 'ws:';
const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
delete protocol;

socket.onopen = (event) => {
    addConsole('Connected to SpotCheck server');
};

socket.onmessage = (event) => {
    const text = event.data;
    addConsole(JSON.parse(text));
};

socket.onclose = (event) => {
    addConsole('Disconnected from SpotCheck server');
};

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
