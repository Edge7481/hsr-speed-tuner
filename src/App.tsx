// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TimelineVisualizer from './TimelineVisualizer';
import Simple from './Simple'

const App = () => {
  return (
    <Router basename="/hsr-speed-tuner">
      <div>
        <h1>HSR Speed Tuner</h1>
        <nav>
          <ul>
            <li><Link to="/simple">Simple Calculator</Link></li>
            <li><Link to="/sim">Timeline</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/sim" element={<TimelineVisualizer />} />
          <Route path="/simple" element={<Simple/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
