import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import AppRoutes from '@/router'

/**
 * App - BrowserRouter 최상위 래퍼
 * 라우트 설정은 src/router/index.jsx 참고
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Analytics />
    </BrowserRouter>
  )
}

export default App
