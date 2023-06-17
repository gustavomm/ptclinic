import { useState } from "react";
import Link from "next/link";
import ArrowDownIcon from "./icons/ArrowDownIcon";

interface MenuOption {
  title: string;
  slug: string;
  description: string;
}

interface DropdownMenuProps {
  options: MenuOption[];
  children: React.ReactNode;
  closeMenu: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  options,
  children,
  closeMenu,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="container">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onTouchEnd={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>

      <div className="relative"></div>
      {isOpen && (
        <ul
          className={`z-10 absolute divide-y divide-gray-100 rounded-lg shadow w-80 bg-vyta-primary-400`}
          onMouseLeave={() => setIsOpen(false)}
        >
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => {
                setIsOpen(false);
                closeMenu();
              }}
            >
              <Link href={`/speciality/${option.slug}`}>
                <span className="p-4 text-white rounded fill-white hover:bg-vyta-secondary-300 hover:fill-vyta-secondary-300 flex flex-column items-center">
                  {option.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
