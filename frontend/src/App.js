import React from 'react';
import './App.css';
import HomePage from './Pages/HomePage';
import ChatPage from './Pages/ChatPage';
import { Route } from 'react-router-dom';

const App = () => {
    return (
        <div className="App">
            <Route path="/" exact component={HomePage} />
            <Route path="/chats" component={ChatPage} />
        </div>
    );
};

export default App;
