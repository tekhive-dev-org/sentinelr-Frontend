import React from 'react'
import './App.css'
import {  Routes, Route } from "react-router-dom"
import LogIn from './Pages/Login/Login'
import SignIn from './Pages/SignUp/SignIn'

function App() {
  return (

      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignIn />} />
      </Routes>
    
  );
}

export default App



