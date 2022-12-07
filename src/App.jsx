import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

// leaflet
import 'leaflet/dist/leaflet.css'

// pages
import Home from './pages/Home'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
])

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}

export default App
