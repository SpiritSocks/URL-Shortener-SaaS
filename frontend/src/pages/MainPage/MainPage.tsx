import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isLoggedIn } from '@/lib/api';

import Header from '../../shared/components/Header/Header';
import LinksMenu from '@/shared/components/LinksMenu/LinksMenu';
import DashboardMenu from '@/shared/components/DashboardMenu/DashboardMenu';
import DomainsMenu from '@/shared/components/DomainsMenu/DomainsMenu';

type Tab = 'links' | 'dashboard' | 'domains';
const validTabs: Tab[] = ['links', 'dashboard', 'domains'];

const MainPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const tabParam = searchParams.get('tab') as Tab | null;
    const initialTab: Tab = tabParam && validTabs.includes(tabParam) ? tabParam : 'links';
    const [activeMenu, setActiveMenu] = useState<Tab>(initialTab);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
        }
    }, [navigate]);

    const handleMenuToggle = (menu: Tab) => {
        setActiveMenu(menu);
        setSearchParams({ tab: menu });
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

        <DomainsMenu
            isOpen={activeMenu === 'domains'}
        />
        <br/>
        </>
    )
}

export default MainPage;
