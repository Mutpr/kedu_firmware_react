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
import Approval from './components/Apporoval/ApprovalMain';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} /> {/* Main homepage route */}
        <Route path="/Board/*" element={<BoardIndex />} />
        <Route path="/mailbox/*" element={<Mailbox />} />
        <Route path="/messenger" element={<Messenger />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/deleteuser" element={<DeleteUser />} /> 
        <Route path="/users/login" element={<Login />} /> 
        <Route path="/approval" element={<Approval/>} />
      </Routes>
    </BrowserRouter>
);

reportWebVitals();
