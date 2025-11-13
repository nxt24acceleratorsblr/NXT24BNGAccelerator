import './App.css'
import InvoiceExtractor from './components/InvoiceExtractor'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <InvoiceExtractor />
      </main>
      <Footer />
    </div>
  )
}

export default App
