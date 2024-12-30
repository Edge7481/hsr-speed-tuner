import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import the App component
import './style.css'; // Import global styles

// Get the root element from the DOM
const rootElement = document.getElementById('root') as HTMLElement;

// Create a root for React to render the application
const root = ReactDOM.createRoot(rootElement);

// Render the App component inside the root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
