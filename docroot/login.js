function register(el) {
    let user_in = document.getElementById("username").value;
    let passwd_in = document.getElementById("password").value;
    if(user_in.length == 0 || passwd_in.length == 0)
        return flashBtn(el);

    users = localStorage.getItem("users");

    if(users) {
        users = JSON.parse(users);
        let taken = users.some((user) => user.username == user_in);
        if(taken)
            return flashBtn(el);
    }else {
        users = [];
    }

    users.push({"username": user_in, "password": passwd_in});
    localStorage.setItem("users", JSON.stringify(users));

    authenticate(user_in);
}

function login(el) {
    let user_in = document.getElementById("username").value;
    let passwd_in = document.getElementById("password").value;
    if(user_in.length == 0 || passwd_in.length == 0)
        return flashBtn(el);

    users = localStorage.getItem("users");

    if(users) {
        users = JSON.parse(users);
        let auth = users.some((user) => user.username == user_in && user.password == passwd_in);
        if(!auth)
            return flashBtn(el);
    }

    authenticate(user_in);
}

function authenticate(username) {
    localStorage.setItem("user", username);
    window.location = "music.html";
}
