import React from 'react';
import ReactDOM from 'react-dom/client';
import { bridge } from './utils/vkBridge';
import App from './App';

bridge.send('VKWebAppInit').catch(() => {
  console.warn('VKWebAppInit failed — running outside VK environment');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
