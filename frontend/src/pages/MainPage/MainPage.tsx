import { useState } from 'react';

import Header from '../../shared/components/Header/Header';
import LinksMenu from '@/shared/components/LinksMenu/LinksMenu';
import DashboardMenu from '@/shared/components/DashboardMenu/DashboardMenu';


const MainPage = () => {

    const [activeMenu, setActiveMenu] = useState<'links' | 'dashboard' | null>('links');

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
        </>
    )
}

export default MainPage;