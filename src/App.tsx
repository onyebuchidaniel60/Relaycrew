import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CreatePipelinePage } from './pages/CreatePipelinePage'
import { DocsPage } from './pages/DocsPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PipelineDetailPage } from './pages/PipelineDetailPage'
import { PipelinesPage } from './pages/PipelinesPage'
import { RiskPage } from './pages/RiskPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="create" element={<CreatePipelinePage />} />
        <Route path="pipelines" element={<PipelinesPage />} />
        <Route path="pipelines/:id" element={<PipelineDetailPage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="risk" element={<RiskPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
