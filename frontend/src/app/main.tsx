import { StrictMode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from '@/lib/AuthContext';
import App from './App.tsx'
import MainPage from '@/pages/MainPage/MainPage.tsx';
import LoginRegistrationPage from '@/pages/LoginRegistrationPage/LoginRegistrationPage.tsx';
import ProfilePage from '@/pages/ProfilePage/ProfilePage.tsx';
import LinkDetailPage from '@/pages/LinkDetailPage/LinkDetailPage.tsx';
import BioPage from '@/pages/BioPage/BioPage.tsx';

import '../assets/style/index.css';

const router = createBrowserRouter([
  {path: '/', element: <App />},
  {path: '/home', element: <MainPage/>},
  {path: '/login', element: <LoginRegistrationPage/>},
  {path: '/profile', element: <ProfilePage/>},
  {path: '/link/:id', element: <LinkDetailPage/>},
  {path: '/@:handle', element: <BioPage/>},
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>
)
