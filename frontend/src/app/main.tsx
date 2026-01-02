import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import LinksMain from '@/shared/components/Links_menu/LinksMain.tsx';

import '../assets/style/index.css'
import { StrictMode } from 'react';
import LoginRegistrationPage from '@/pages/LoginRegistrationPage.tsx';


const router = createBrowserRouter([
  {path: '/', element: <App />},
  {path: '/linkshomepage', element: <LinksMain />},
  {path: '/login', element: <LoginRegistrationPage/>},
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
)
