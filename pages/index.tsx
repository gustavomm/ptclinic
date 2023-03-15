import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { StaffProfile } from "../components/StaffProfile";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Vyta Fisioterapia</title>
      </Head>
      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center px-8 lg:px-36 text-center mt-32 pb-20 gap-8">
        <section className="flex flex-col items-center" id="home">
          {/* <h1 className="text-6xl font-bold ">
            <a className="text-transparent text-vyta-primary-400 font-serif">
              Vyta
            </a>
          </h1> */}
          <Image
            className="align-center"
            src="/LOGOTIPO 004.png"
            alt="logo"
            width={150}
            height={150}
          />

          <p className="mt-6 text-left text-vyta-tertiary-900">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum
          </p>
        </section>

        <section id="quem-somos">
          <h1 className="text-3xl font-bold mt-8 text-vyta-primary-400">
            Quem somos
          </h1>
          <div className="flex flex-col md:flex-row align-center justify-center gap-6 md:gap-4 mt-5">
            <StaffProfile
              name="Vyvyan Maximo Andrade"
              imgSrc="/Vyvyan.png"
              imgAlt="Vyvyan fisioterapeuta"
              description={[
                "• Crefito 3: 293919F",
                "• Graduada em Fisioterapia pela Universidade de São Paulo - USP",
                "• Residência em Neurologia e Neurocirurgia pelo Hospital São Paulo - Unifesp",
              ]}
            />
            <StaffProfile
              name="Tainá Horacio Peixoto"
              imgSrc="/Taina.png"
              imgAlt="Taina fisioterapeuta"
              description={[
                "• Crefito 3: 293916F",
                "• Graduada em Fisioterapia pela Universidade de São Paulo - USP",
                "• Residência em Oncologia pelo Hospital AC Camargo Cancer Center",
              ]}
            />
          </div>
        </section>

        <section className="w-full" id="localizacao">
          <h1 className="text-3xl font-bold mt-8 text-transparent text-vyta-primary-400 mb-5">
            Localização
          </h1>
          <div className="w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.22316475309!2d-46.66323314902009!3d-23.56042718460815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5917423c786b%3A0x967aa4e1ef189630!2sR.%20Padre%20Jo%C3%A3o%20Manuel%2C%20222%20-%20Jardim%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2001411-001!5e0!3m2!1sen!2sbr!4v1678840712347!5m2!1sen!2sbr"
              width="100%"
              height="450"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        <section>
          <a
            href="https://wa.me/message/FJNBBFEBI6V5O1"
            className="fixed bottom-10 right-5 md:bottom-15 md:right-15"
            target="_blank"
          >
            <Image
              src="/whatsapp.png"
              alt="whatsapp icon"
              width={70}
              height={70}
            />
          </a>
        </section>
      </main>

      <footer className="flex flex-col h-24 w-full items-center justify-center border-t gap-2 bg-slate-50">
        <div className="flex">
          <a
            className="flex items-center justify-center"
            href="https://instagram.com/vytafisioterapia"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/instagram.png"
              alt="instagram icon"
              width={30}
              height={30}
            />
            <span>Instagram</span>
          </a>
        </div>
        <a
          className="flex items-center justify-center gap-2 text-sm"
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
