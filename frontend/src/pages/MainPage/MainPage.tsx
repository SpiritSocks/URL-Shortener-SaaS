import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '@/lib/api';

import Header from '../../shared/components/Header/Header';
import LinksMenu from '@/shared/components/LinksMenu/LinksMenu';
import DashboardMenu from '@/shared/components/DashboardMenu/DashboardMenu';

const MainPage = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState<'links' | 'dashboard' | null>('links');

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
        }
    }, [navigate]);

    const handleMenuToggle = (menu: 'links' | 'dashboard') => {
        setActiveMenu(menu);
    };

    return (
        <>
        <Header
            activeMenu={activeMenu}
            onMenuClick={handleMenuToggle}
        />

        <LinksMenu
            isOpen={activeMenu === 'links'}
        />

        <DashboardMenu
            isOpen={activeMenu === 'dashboard'}
        />
        <br/>
        </>
    )
}

export default MainPage;
