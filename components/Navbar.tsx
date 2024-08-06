import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ArrowDownIcon from "./icons/ArrowDownIcon";
import DropdownMenu from "./DropdownMenu";
import specialities from "../constants/specialities";
import PhoneIcon from "./icons/PhoneIcon";
import WhatsappIcon from "./icons/WhatsappIcon";
import InstagramIcon from "./icons/InstagramIcon";
import EmailIcon from "./icons/EmailIcon";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-primary-400 bg-opacity-80 backdrop-blur fixed z-20 top-0 left-0 navbar">
      <div className="flex items-center flex-wrap justify-between w-full">
        <Link href="/#home" className="flex items-center">
          {/* <span className="self-center text-3xl font-semibold whitespace-nowrap font-serif text-transparent bg-clip-text bg-gradient-to-r from-vyta-secondary-300 to-violet-500">
            Vyta
          </span> */}
          <Image src="/LOGOTIPO 006.webp" alt="logo" width={60} height={60} />
        </Link>
        <div className="flex md:order-2">
          <div className="flex align-center gap-4 p-2 bg-primary-300 rounded-2xl">
            <Link
              href="tel:+5511989172311"
              className="flex items-center gap-2 redirect-phone"
            >
              <PhoneIcon className="text-slate-50 w-8 h-8" />
            </Link>
            <Link
              href="/whatsapp"
              className="lg:flex items-center hidden gap-2 redirect-whatsapp"
            >
              <WhatsappIcon className="fill-slate-50 text-slate-50 w-8 h-8" />
            </Link>
            <Link
              href="mailto:contato@vytafisioterapia.com.br"
              className="flex items-center gap-2 redirect-email"
            >
              <EmailIcon className="text-slate-50 w-8 h-8" />
            </Link>
            <Link
              className="flex items-center gap-2 redirect-instagram"
              href="https://instagram.com/vytafisioterapia"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon className="text-slate-50 fill-slate-50 w-7 h-7" />
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex items-center p-2 text-sm text-primary-100 rounded-lg md:hidden hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-gray-200 "
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between md:pl-[10vw] w-full md:flex md:w-auto md:order-1 lg:visible ${
            !isOpen && "max-md:hidden"
          }`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-primary-300 md:flex-row md:space-x-8 md:mt-0 md:text-lg md:border-0 md:bg-transparent">
            <li>
              <Link
                href="/#home"
                onClick={() => setIsOpen(!isOpen)}
                className="block py-2 pl-3 pr-4 text-white rounded hover:bg-vyta-secondary-300 md:hover:bg-transparent md:hover:text-vyta-secondary-300 md:p-0"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/#quem-somos"
                onClick={() => setIsOpen(!isOpen)}
                className="block py-2 pl-3 pr-4 text-white rounded hover:bg-vyta-secondary-300 md:hover:bg-transparent md:hover:text-vyta-secondary-300 md:p-0 "
              >
                Quem somos
              </Link>
            </li>
            <li>
              <DropdownMenu
                options={Object.values(specialities)}
                closeMenu={() => setIsOpen(false)}
              >
                <div className="cursor-pointer py-2 pl-3 pr-4 text-white rounded fill-white hover:bg-vyta-secondary-300 md:hover:fill-vyta-secondary-300 md:hover:bg-transparent md:hover:text-vyta-secondary-300 md:p-0 flex flex-column items-center">
                  <span>Especialidades</span>
                  <ArrowDownIcon className="text-white w-4 h-4" />
                </div>
              </DropdownMenu>
            </li>
            <li>
              <Link
                href="/#localizacao"
                onClick={() => setIsOpen(!isOpen)}
                className="block py-2 pl-3 pr-4 text-white rounded hover:bg-vyta-secondary-300 md:hover:bg-transparent md:hover:text-vyta-secondary-300 md:p-0 "
              >
                Localização
              </Link>
            </li>
            <li>
              <Link
                href="/#contato"
                onClick={() => setIsOpen(!isOpen)}
                className="block py-2 pl-3 pr-4 text-white rounded hover:bg-vyta-secondary-300 md:hover:bg-transparent md:hover:text-vyta-secondary-300 md:p-0 "
              >
                Contato
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                onClick={() => setIsOpen(!isOpen)}
                className="block py-2 pl-3 pr-4 text-white rounded hover:bg-vyta-secondary-300 md:hover:bg-transparent md:hover:text-vyta-secondary-300 md:p-0 "
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
