// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './components/Home'; // Import the Home component
import Room from './components/Room';
import './styles.css'; // Import your global styles

const { Content } = Layout;

function App() {
  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Router>
        <Content
          style={{
            width: '100%',
            minWidth: '100%',
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </Content>
      </Router>
    </Layout>
  );
}

export default App;
