import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from './App';
import { BoardIndex, BoardEdit, BoardDetail } from './pages/Board_jongho';
import Mailbox from './components/Mailbox/Mailbox';
import Messenger from './pages/Messenger/Messenger'; // Messenger 컴포넌트 import
import Login from './components/LoginIk/Login';
import Admin from './components/LoginIk/Admin/Admin';
import DeleteUser from './components/LoginIk/Admin/DeleteUser'; 
import axios from 'axios';
import Mypage from './components/Mypage/Mypage';
import Approval from './components/Apporoval/ApprovalMain';
import FileDrive from './components/FileDrive/FileDriveMain';
import Calendar from './components/Calendar/Calendar';
import Attendance from './components/Attendance/Attendance';

axios.defaults.withCredentials = true


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} /> {/* Main homepage route */}
        <Route path="/Attendance/*" element={<Attendance/>} />
        <Route path="/Board/*" element={<BoardIndex />} />
        <Route path="/mailbox/*" element={<Mailbox />} />
        <Route path="/messenger" element={<Messenger />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/deleteuser" element={<DeleteUser />} /> 
        <Route path="/users/login" element={<Login />} /> 
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/approval" element={<Approval/>} />
        <Route path="/file" element={<FileDrive/>}/>
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
)

reportWebVitals();