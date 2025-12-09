import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import Try1 from './Try1.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <Try1 /> */}
  </StrictMode>,
)
