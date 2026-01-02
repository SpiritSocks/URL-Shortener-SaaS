import { StrictMode } from 'react';
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import App from './App.tsx'
import MainPage from '@/pages/MainPage/MainPage.tsx';
import LoginRegistrationPage from '@/pages/LoginRegistrationPage/LoginRegistrationPage.tsx';
import ProfilePage from '@/pages/ProfilePage/ProfilePage.tsx'; 

import '../assets/style/index.css';

const router = createBrowserRouter([
  {path: '/', element: <App />},
  {path: '/home', element: <MainPage/>},
  {path: '/login', element: <LoginRegistrationPage/>},
  {path: '/profile', element: <ProfilePage/>},
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
)
