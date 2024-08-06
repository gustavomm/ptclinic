import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { StaffProfile } from "../components/StaffProfile";
import PhoneIcon from "../components/icons/PhoneIcon";
import EmailIcon from "../components/icons/EmailIcon";
import InstagramIcon from "../components/icons/InstagramIcon";
import WhatsappIcon from "../components/icons/WhatsappIcon";
import Hero from "../components/Hero";
import SpecialitiesCarousel from "../components/SpecialitiesCarousel";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center w-screen overflow-x-clip">
      <Head>
        <title>Vyta Fisioterapia</title>
      </Head>
      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center text-center pb-20 gap-8">
        <section
          className="flex flex-col items-center gap-5 md:gap-10 w-full mt-[76px]"
          id="home"
        >
          <Hero />
        </section>

        <div className="divider mx-20"></div>

        <section id="especialidades" className="w-full">
          <h1 className="text-3xl font-bold text-primary-400 mb-10">
            Especialidades
          </h1>
          <SpecialitiesCarousel />
        </section>

        <div className="divider mx-20"></div>

        <section id="quem-somos">
          <h1 className="text-3xl font-bold text-primary-400">Quem somos</h1>
          <div className="flex flex-col md:flex-row align-center justify-center gap-6  mt-10">
            <StaffProfile
              name="Vyvyan Maximo Andrade"
              imgSrc="/vyvyan-3.webp"
              imgAlt="Vyvyan fisioterapeuta"
              description={[
                "Graduada em Fisioterapia pela Universidade de São Paulo - USP",
                "Residência em Neurologia e Neurocirurgia pelo Hospital São Paulo - Unifesp",
                "Crefito 3: 293919F",
              ]}
            />
            <StaffProfile
              name="Tainá Horacio Peixoto"
              imgSrc="/taina-3.webp"
              imgAlt="Taina fisioterapeuta"
              description={[
                "Graduada em Fisioterapia pela Universidade de São Paulo - USP",
                "Residência em Oncologia pelo Hospital AC Camargo Cancer Center",
                "Crefito 3: 293916F",
              ]}
            />
          </div>
        </section>

        <div className="divider mx-20"></div>

        <section
          className="w-full flex items-center flex-col gap-10"
          id="localizacao"
        >
          <h1 className="text-3xl font-bold text-primary-400">Localização</h1>
          <div className="w-[80vw] lg:w-[70vw]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d427.96519633859407!2d-46.66115957244263!3d-23.559992771406215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce592d449e10dd%3A0x9fb98fcb63eab6f4!2sVyta%20Fisioterapia!5e0!3m2!1sen!2sbr!4v1678887676221!5m2!1sen!2sbr"
              width="100%"
              height="450"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        <div className="divider mx-20"></div>

        <section
          className="flex flex-col align-center justify-center text-lg"
          id="contato"
        >
          <h1 className="text-3xl font-bold text-primary-400 mb-5">Contato</h1>
          <div className="flex align-center gap-6 p-4 bg-slate-100 rounded-2xl">
            <Link
              href="tel:+5511989172311"
              className="flex items-center gap-2 redirect-phone"
            >
              <PhoneIcon className="text-vyta-secondary-400 w-8 h-8" />
            </Link>
            <Link
              href="/whatsapp"
              className="flex items-center gap-2 redirect-whatsapp"
            >
              <WhatsappIcon className="fill-vyta-secondary-400 text-white w-8 h-8" />
            </Link>
            <Link
              href="mailto:contato@vytafisioterapia.com.br"
              className="flex items-center gap-2 redirect-email"
            >
              <EmailIcon className="text-vyta-secondary-400 w-8 h-8" />
            </Link>
            <Link
              className="flex items-center gap-2 redirect-instagram"
              href="https://instagram.com/vytafisioterapia"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon className="text-white fill-vyta-secondary-400 w-7 h-7" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export const getStaticProps = () => {
  return {
    props: {},
  };
};

export default Home;
