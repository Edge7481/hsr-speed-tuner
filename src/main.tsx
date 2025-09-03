import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BattleProvider } from './context/BattleContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BattleProvider>
      <App />
    </BattleProvider>
  </React.StrictMode>
);
