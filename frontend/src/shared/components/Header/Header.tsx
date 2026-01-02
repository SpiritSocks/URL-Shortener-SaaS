import { Button } from "@/components/ui/button";
import { useState } from "react";
import styles from '../Header/Header.module.css';

const Header = () => {

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleClick = (buttonId: string) => {
    setActiveButton(activeButton === buttonId ? null : buttonId);
  };

  return (
    <header className="h-[120px] w-full bg-[#343b1b] flex justify-between px-5">
        
      <div className="flex flex-row items-center justify-center gap-5">
        <div className="bg-[#ebe6d2]">icon</div>
        <div className="flex flex-col items-start">
          <h1 className="font-extrabold text-[42px] text-[#ebe6d2]">URL SHORTENER</h1>
          <p className="text-[#f6e6a5]">Create short links</p>
        </div>
      </div>

      <nav className="flex flex-row gap-[50px] items-center px-2">
        <Button
          className={activeButton === "links" ? styles.button_active : styles.button_inactive}
          onClick={() => handleClick("links")}
        >
          Links
        </Button>
        <Button
          className={activeButton === "dashboard" ? styles.button_active : styles.button_inactive}
          onClick={() => handleClick("dashboard")}
        >
          Dashboard
        </Button>
        <Button
          className={activeButton === "profile" ? styles.button_active : styles.button_inactive}
          onClick={() => handleClick("profile")}
        >
          Profile
        </Button>
      </nav>
    </header>
  );
};

export default Header;