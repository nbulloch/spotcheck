import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

import { Login } from './login';
import { Music } from './music';
import { Manage } from './manage';

import './spotcheck.css';

export default function App() {
    return (
        <BrowserRouter>
            <div className='body'>
                <header>
                    <nav className='navbar'>
                        <NavLink className='nav-link' to='music'>Music<sup id='notify'>0</sup></NavLink>
                        <NavLink className='nav-link' to='manage'>Manage</NavLink>
                        <div id='currentUser' className='nav-split'></div>
                        <NavLink className='nav-link' to='' id='login'>Login</NavLink>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path='/music' element={<Music />}></Route>
                        <Route path='/manage' element={<Manage />}></Route>
                        <Route path='*' element={<Login />}></Route>
                    </Routes>
                </main>
                <footer className='navbar'>
                    <span>Nathan Bulloch</span>
                    <a className='nav-split' target='_blank' href='https://github.com/nbulloch/startup'>GitHub</a>
                </footer>
            </div>
        </BrowserRouter>
    );
}
