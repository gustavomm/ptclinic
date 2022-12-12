import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-transparent px-2 backdrop-blur sm:px-4 py-2.5 fixed w-full z-20 top-0 left-0 border-b border-gray-200">
      <div className="container flex flex-wrap items-center justify-between mx-auto">
        <a href="" className="flex items-center">
          <span className="self-center text-3xl font-semibold whitespace-nowrap font-serif text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-500">
            Vyta
          </span>
        </a>
        <div className="flex md:order-2">
          <button
            type="button"
            className="text-black bg-cyan-300 hover:bg-cyan-800 focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"
          >
            Contato
          </button>
          <button
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-gray-200 "
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
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 lg:visible ${
            !isOpen && "max-md:hidden"
          }`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-slate-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-transparent ">
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-cyan-300 md:hover:bg-transparent md:hover:text-cyan-300 md:p-0 "
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-cyan-300 md:hover:bg-transparent md:hover:text-cyan-300 md:p-0 "
              >
                Quem somos
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-cyan-300 md:hover:bg-transparent md:hover:text-cyan-300 md:p-0 "
              >
                Localização
              </a>
            </li>
            {/* <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-cyan-300 md:hover:bg-transparent md:hover:text-cyan-300 md:p-0 "
              >
                Contact
              </a>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
