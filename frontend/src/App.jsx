// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import MainLayout from './layouts/MainLayout'
import Dashboard  from './pages/Dashboard'
import Scraper    from './pages/Scraper'
import Analytics  from './pages/Analytics'
import Export     from './pages/Export'
import Database   from './pages/Database'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index             element={<Dashboard  />} />
            <Route path="scraper"    element={<Scraper    />} />
            <Route path="analytics"  element={<Analytics  />} />
            <Route path="export"     element={<Export     />} />
            <Route path="database"   element={<Database   />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
