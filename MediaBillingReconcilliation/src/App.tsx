import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import InvoiceExtractor from './components/InvoiceExtractor'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/extractor"
        element={
          <div className="app">
            <Header />
            <main className="main-content">
              <InvoiceExtractor />
            </main>
            <Footer />
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
