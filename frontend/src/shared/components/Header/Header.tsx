import { Button } from "@/components/ui/button";
import { Link2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import styles from "./Header.module.css";

interface HeaderProps {
  activeMenu: 'links' | 'dashboard' | 'domains' | 'bio' | null;
  onMenuClick: (menu: 'links' | 'dashboard' | 'domains' | 'bio') => void;
}

const Header = ({ activeMenu, onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-[#343b1b]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="size-8 sm:size-10 flex items-center">
            <Link2 className="w-8 h-8 sm:w-10 sm:h-10" color="white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-white text-2xl sm:text-3xl lg:text-[42px] leading-tight">
              Linxie
            </h1>
            <p className="text-[#f6e6a5] text-sm sm:text-base">
              Создавайте короткие ссылки
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-6 items-center justify-start md:justify-end">
          <Button
            className={activeMenu === "links" ? styles.button_active : styles.button_inactive}
            onClick={() => onMenuClick("links")}
          >
            Ссылки
          </Button>

          <Button
            className={activeMenu === "dashboard" ? styles.button_active : styles.button_inactive}
            onClick={() => onMenuClick("dashboard")}
          >
            Аналитика
          </Button>

          <Button
            className={activeMenu === "domains" ? styles.button_active : styles.button_inactive}
            onClick={() => onMenuClick("domains")}
          >
            Домены
          </Button>

          <Button
            className={activeMenu === "bio" ? styles.button_active : styles.button_inactive}
            onClick={() => onMenuClick("bio")}
          >
            Био
          </Button>

          <Button
            className={styles.button_inactive}
            onClick={handleProfileClick}
          >
            Профиль
          </Button>

          <Button
            className={styles.button_inactive}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Выйти
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
