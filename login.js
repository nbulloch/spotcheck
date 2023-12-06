function basicAuth(user, pwd) {
    return { 'Authorization': 'Basic ' + btoa(`${user}:${pwd}`) };
}

async function register(el) {
    let user_in = document.getElementById("username").value;
    let passwd_in = document.getElementById("password").value;
    if(user_in.length == 0 || passwd_in.length == 0)
        return flashBtn(el);

    const res = await fetch('/api/user', {
        method: 'POST',
        headers: basicAuth(user_in, passwd_in)
    });

    if(res.status != 200) {
        return flashBtn(el);
    }

    const body = await res.json();
    setToken(user_in, body.token);
}

async function login(el) {
    let user_in = document.getElementById("username").value;
    let passwd_in = document.getElementById("password").value;
    if(user_in.length == 0 || passwd_in.length == 0)
        return flashBtn(el);

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: basicAuth(user_in, passwd_in)
    });

    if(res.status != 200)
        return flashBtn(el);

    const body = await res.json();
    setToken(user_in, body.token);
}

function setToken(user, token) {
    localStorage.setItem("user", user);
    localStorage.setItem("token", token);
    window.location = "music.html";
}
