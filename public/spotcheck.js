window.onload = function() {
    let username = localStorage.getItem('user');
    if(username) {
        userEl = document.getElementById('currentUser');
        userEl.innerText = username;

        loginEl = document.getElementById('login');
        loginEl.onclick = logout;
        loginEl.innerText = 'Logout';

        setNotification();
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

function authExpired() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location = 'index.html';
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

socket.onmessage = (event) => {
    const text = event.data;
    const obj = JSON.parse(text);
    if(obj.msg === null) {
        const numUpdated = obj.length;
        addConsole(`Updated ${numUpdated} artists`);
    }else {
        addConsole(obj.msg);
    }
};

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

function setNotification() {
    let data = localStorage.getItem('music-table');
    if(data !== null) {
        data = JSON.parse(data);
        const numReleases = data.filter((row) => row[2/*status*/] === "New Release").length;
        let notify = document.getElementById("notify");
        notify.innerText = numReleases;
    }
}

