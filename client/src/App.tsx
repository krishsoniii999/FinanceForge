import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { StockDetail } from './pages/StockDetail'
import { PaperTrading } from './pages/PaperTrading'
import { Portfolio } from './pages/Portfolio'
import { Lessons } from './pages/Lessons'
import { LessonDetail } from './pages/LessonDetail'
import { Settings } from './pages/Settings'
import { Research } from './pages/Research'
import { News } from './pages/News'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route path="/trade" element={<PaperTrading />} />
            <Route path="/trade/:symbol" element={<PaperTrading />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/research" element={<Research />} />
            <Route path="/news" element={<News />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:lessonId" element={<LessonDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
