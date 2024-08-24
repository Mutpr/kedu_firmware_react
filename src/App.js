import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 리디렉션을 위해 useNavigate 사용
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import './App.css';
import axios from 'axios';

axios.defaults.withCredentials = true;

const App = () => {
  const navigate = useNavigate(); // 페이지 이동을 위해 useNavigate 훅 사용
  useEffect(() => {
    const loginID = sessionStorage.getItem('loginID');
    if (!loginID) {
      navigate('/users/login');
    }
  }, [navigate]);

  return (
    <div className="app">
      <Header />
      <div className="container">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
};

export default App;
