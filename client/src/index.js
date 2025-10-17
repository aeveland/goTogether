import React from 'react';
import { createRoot } from 'react-dom/client';
import { HeroUIProvider } from '@heroui/react';
import App from './App';
import './styles/main.css';

console.log('Go Together app starting with Hero UI');

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
  <HeroUIProvider>
    <App />
  </HeroUIProvider>
);
