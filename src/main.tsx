import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BattleProvider } from './context/BattleContext';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider  value={defaultSystem}>
    <BattleProvider>
      <App />
    </BattleProvider>
    </ChakraProvider>
  </React.StrictMode>
);
