import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Room from './components/Room';

import './styles.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Маршрут для Home, без хедера */}
        <Route path="/" element={<Home />} />

        {/* Маршрут для Room, с хедером */}
        <Route path="/room/:roomId" element={<Room />}>
          <Route path="" element={<Room />} />
          {/* Добавьте другие вложенные маршруты внутри Room при необходимости */}
        </Route>

        {/* Другие маршруты можно добавлять здесь */}
      </Routes>
    </Router>
  );
}

export default App;