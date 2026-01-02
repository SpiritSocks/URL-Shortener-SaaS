import { Button } from "@/components/ui/button";
import { useState } from "react";
import styles from "../Header/Header.module.css";
import { Link2 } from "lucide-react";


const Header = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleClick = (buttonId: string) => {
    setActiveButton(activeButton === buttonId ? null : buttonId);
  };

  return (
    <header className="w-full bg-[#343b1b]">
      <div
        className="
          mx-auto max-w-6xl
          px-4 sm:px-6
          py-4
          flex flex-col gap-4
          md:flex-row md:items-center md:justify-between
        "
      >
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="size-10 flex items-center">
            <Link2 size={50} color="white"/>
          </div>

          <div className="min-w-0">
            <h1
              className="
                font-bold text-white
                text-2xl sm:text-3xl lg:text-[42px]
                leading-tight
                wrap-break-word
              "
            >
              Url Shortener
            </h1>
            <p className="text-[#f6e6a5] text-sm sm:text-base">
              Create short links
            </p>
          </div>
        </div>
        <nav
          className="
            flex flex-wrap
            gap-2 sm:gap-3 md:gap-4 lg:gap-6
            items-center
            justify-start md:justify-end
          "
        >
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
      </div>
    </header>
  );
};

export default Header;