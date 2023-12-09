import React from 'react';
import {
    NavLink, Navigate, Route, Routes, useNavigate
} from 'react-router-dom';

import Login from './login';
import Music from './music';
import Manage from './manage';
import HTTPClient from './httpClient';

import './spotcheck.css';

let client = new HTTPClient;
let ws = null;

function wsConnect() {
    if(!ws) {
        const protocol = window.location.protocol == 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

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

        socket.onclose = (event) => {
            ws = null;
        }
    }
}

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

export default function App() {
    const [user,  setUser] = React.useState();
    const [token, setToken] = React.useState();
    const navigate = useNavigate();

    const logout = () => {
        if(token) {
            client.getService('/api/login', { method: 'DELETE' });
            setUser(null);
        }
        setToken(null);
        navigate('/');
    };
    client.onStatus(401, () => {
        addConsole('Login expired');
        logout();
    });

    const login = (_user, _token) => {
        setUser(_user);
        setToken(_token);
        wsConnect()
        navigate('/music')
    }

    React.useEffect(() => {
        if(token) {
            client.setToken(token);
        }else {
            client.clearAuth();
        }
    }, [user, token]);

    const loadData = function(endpoint, update) {
        const [data, setData] = React.useState();
        React.useEffect(() => {
            if(!token)
                return;

            let ignore = false;

            const getData = async function() {
                const obj = await client.getService(endpoint);
                if (!ignore) {
                    setData(obj);
                }
            }
            getData();

            return () => {
                ignore = true;
            };
        }, [user, endpoint, update]);
        return [data, setData];
    }

    const [getMusic, updateMusic] = React.useState(0);
    const [getManage, updateManage] = React.useState(0);
    const [music, setMusic] = loadData('/api/albums', getMusic);
    const [manage, setManage] = loadData('/api/artists', getManage);

    const [notify, setNotify] = React.useState(0);

    const putAlbum = (body) => client.getService('/api/albums', {
            method: 'PUT',
            body: JSON.stringify(body)
        });

    React.useEffect(() => {
        if(music) {
            const newMusic = music.filter((album) => {
                return album.status === 'New Release';
            });

            setNotify(newMusic.length);
        }
    }, [music]);

    const musicPage = React.useMemo(() => {
        return (
            <Music data={ music } putAlbum={ putAlbum } setNotify={ setNotify } />
        );
    }, [music]);

    const managePage = React.useMemo(() => {
        const refresh = () => {
            updateMusic(getMusic + 1);
            updateManage(getManage + 1);
        }
        return (
            <Manage data={ manage } client={ client } refreshData={ refresh } />
        );
    }, [manage]);

    return (
        <div className='body'>
            <header>
                <nav className='navbar'>
                    {token && (
                        <>
                            <NavLink className='nav-link' to='music'>
                                Music
                                <sup id='notify'>{ notify }</sup>
                            </NavLink>
                            <NavLink className='nav-link' to='manage'>
                                Manage
                            </NavLink>
                        </>
                    )}
                    <div id='currentUser' className='nav-split'>{user}</div>
                    {token ? (
                        <NavLink className='nav-link' to=''
                            id='login' onClick={ logout }>Logout</NavLink>
                    ) : (
                        <NavLink className='nav-link' to=''
                            id='login'>Login</NavLink>
                    )}
                </nav>
            </header>
            <Routes>
                {token && (
                    <>
                        <Route path='/music' element={ musicPage }></Route>
                        <Route path='/manage' element={ managePage }></Route>
                    </>
                )}
                <Route path='/' element={
                    <Login login={login} showError={addConsole} />
                } exact></Route>
                <Route path='*' element={<Navigate to='/' />}></Route>
            </Routes>
            <footer className='navbar'>
                <span>Nathan Bulloch</span>
                <a className='nav-split' target='_blank' href='https://github.com/nbulloch/startup'>GitHub</a>
            </footer>
        </div>
    );
}
