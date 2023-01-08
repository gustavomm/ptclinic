import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Navbar from "../components/Navbar";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Vyta Fisioterapia</title>
      </Head>
      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center px-8 lg:px-36 text-center md:pt-24 max-md:pt-16 pb-20">
        <h1 className="text-6xl font-bold ">
          <a className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-500 font-serif">
            Vyta
          </a>
        </h1>

        <p className="mt-6 text-left">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum
        </p>

        <h1 className="text-3xl font-bold mt-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-500">
          Quem somos
        </h1>
        <div className="flex flex-col md:flex-row align-center justify-center gap-6 md:gap-4 mt-5">
          <div className="flex flex-col items-center w-[350px] gap-2">
            <div className="relative h-[370px] w-[350px]">
              <Image
                src="/Vyvyan.png"
                alt="Vyvyan"
                fill={true}
                objectFit="contain"
                className="bg-slate-100 p-4 rounded-2xl"
              ></Image>
            </div>
            <h3 className="font-serif text-3xl">Vyvyan Maximo Andrade</h3>
            <div className="text-left px-3">
              <p>• Crefito 3: 293919F </p>
              <p>
                • Graduada em Fisioterapia pela Universidade de São Paulo - USP
              </p>
              <p>
                • Residência em Neurologia e Neurocirurgia pelo Hospital São
                Paulo - Unifesp
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center w-[350px] gap-2">
            <div className="relative h-[370px] w-[350px]">
              <Image
                src="/Taina.png"
                alt="Vyvyan"
                fill={true}
                objectFit="contain"
                className="bg-slate-100 p-4 rounded-2xl"
              ></Image>
            </div>
            <h3 className="font-serif text-3xl">Tainá Horacio Peixoto</h3>
            <div className="text-left px-3">
              <p>• Crefito 3: 293916F </p>
              <p>
                • Graduada em Fisioterapia pela Universidade de São Paulo - USP
              </p>
              <p>
                • Residência em Oncologia pelo Hospital AC Camargo Cancer Center
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mt-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-500 mb-5">
          Localização
        </h1>
        <div className="w-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10977.566264186069!2d-46.68692554072565!3d-23.5368301137205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce57dd48fb8f4d%3A0x8836a82d53498886!2sS%C3%A3o%20Camilo%20Hospital!5e0!3m2!1sen!2sbr!4v1670812733337!5m2!1sen!2sbr"
            width="100%"
            height="450"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <h1 className="text-3xl font-bold mt-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-500 mb-5">
          Contato
        </h1>
        <a href="" className="fixed bottom-10 right-5 md:bottom-15 md:right-15">
          <Image
            src="/whatsapp.png"
            alt="whatsapp icon"
            width={70}
            height={70}
          />
        </a>
      </main>

      <footer className="flex flex-col h-24 w-full items-center justify-center border-t gap-2 bg-slate-50">
        <div className="flex">
          <a
            className="flex items-center justify-center gap-2"
            href="https://instagram.com/vytafisioterapia"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
        <a
          className="flex items-center justify-center gap-2"
          href="https://github.com/gustavomm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Website by Gustavo Moreira
        </a>
      </footer>
    </div>
  );
};

export const getStaticProps = () => {
  return {
    props: {},
  };
};

export default Home;
