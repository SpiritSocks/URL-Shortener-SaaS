import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import MainPage from '@/pages/MainPage/MainPage.tsx';

import '../assets/style/index.css'
import { StrictMode } from 'react';
import LoginRegistrationPage from '@/pages/LoginRegistrationPage/LoginRegistrationPage.tsx';



const router = createBrowserRouter([
  {path: '/', element: <App />},
  {path: '/home', element: <MainPage/>},
  {path: '/login', element: <LoginRegistrationPage/>},
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
)
