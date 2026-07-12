import { useState } from 'react'
import DataProvider from './DataProvider.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import Collections from './components/Collections.jsx'
import Featured from './components/Featured.jsx'
import Story from './components/Story.jsx'
import Testimonials from './components/Testimonials.jsx'
import Newsletter from './components/Newsletter.jsx'
import Footer from './components/Footer.jsx'
import Clients from './components/Clients.jsx'
import Measurements from './components/Measurements.jsx'
import Transactions from './components/Transactions.jsx'
import Dashboard from './components/Dashboard.jsx'

function App() {
  const [page, setPage] = useState('home')
  const [editTarget, setEditTarget] = useState(null)

  const navigate = (id, edit = null) => {
    setPage(id)
    setEditTarget(edit)
    window.scrollTo(0, 0)
  }

  const startEdit = (kind, id) =>
    navigate(kind === 'measurement' ? 'measurements' : 'transactions', { kind, id })

  return (
    <DataProvider>
      <Navbar page={page} onNavigate={navigate} />
      <main>
        {page === 'home' && (
          <>
            <Hero />
            <Marquee />
            <Collections />
            <Featured />
            <Story />
            <Testimonials />
            <Newsletter />
          </>
        )}
        {page === 'clients' && <Clients onEdit={startEdit} onNavigate={navigate} />}
        {page === 'measurements' && (
          <Measurements
            key={editTarget?.id ?? 'new'}
            editId={editTarget?.kind === 'measurement' ? editTarget.id : null}
            onDone={editTarget ? () => navigate('clients') : null}
          />
        )}
        {page === 'transactions' && (
          <Transactions
            key={editTarget?.id ?? 'new'}
            editId={editTarget?.kind === 'transaction' ? editTarget.id : null}
            onDone={editTarget ? () => navigate('clients') : null}
          />
        )}
        {page === 'dashboards' && <Dashboard onNavigate={navigate} />}
      </main>
      <Footer />
    </DataProvider>
  )
}

export default App
