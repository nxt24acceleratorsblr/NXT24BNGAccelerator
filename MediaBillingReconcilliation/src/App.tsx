import { useState } from 'react'
import './App.css'
import CampaignGenerator from './components/CampaignGenerator'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <CampaignGenerator />
      </main>
      <Footer />
    </div>
  )
}

export default App
