/**
 * Application Entry Point
 * 
 * This is the main entry point for the React application.
 * It renders the App component into the DOM root element.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
