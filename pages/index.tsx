import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { StaffProfile } from "../components/StaffProfile";
import PhoneIcon from "../components/icons/PhoneIcon";
import EmailIcon from "../components/icons/EmailIcon";
import InstagramIcon from "../components/icons/InstagramIcon";
import WhatsappIcon from "../components/icons/WhatsappIcon";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Vyta Fisioterapia</title>
      </Head>
      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center text-center mt-32 pb-20 gap-8">
        <section
          className="flex flex-col items-center gap-5 md:gap-10 mt-5 md:mt-10"
          id="home"
        >
          {/* <h1 className="text-6xl font-bold ">
            <a className="text-transparent text-vyta-primary-400 font-serif">
              Vyta
            </a>
          </h1> */}
          <Image
            className="align-center"
            src="/LOGOTIPO 004.png"
            alt="logo"
            width={200}
            height={200}
          />

          <p className="mt-6 text-justify text-vyta-tertiary-900 md:text-lg">
            Bem-vindo à VYTA fisioterapia especializada, onde o nosso principal
            compromisso é fornecer um atendimento humanizado e personalizado
            para cada um dos nossos pacientes. Aqui, entendemos que cada
            indivíduo é único e, portanto, merece um tratamento cuidadosamente
            adaptado às suas necessidades. Nosso objetivo é ajudar nossos
            pacientes a alcançar seus objetivos de saúde e bem-estar, seja
            através da reabilitação após uma lesão, melhoria da mobilidade,
            redução da dor ou melhoria da qualidade de vida. Estamos
            comprometidos em fornecer uma abordagem integral e individualizada
            para cada um dos nossos pacientes, ajudando-os a atingir seus
            objetivos de forma eficaz e eficiente. Contamos com uma equipe
            altamente qualificada de fisioterapeutas, que possuem uma vasta
            experiência em diversas áreas da fisioterapia e está sempre
            atualizada com as últimas técnicas e tecnologias para oferecer o
            melhor tratamento possível. Entre em contato para agendar sua
            consulta inicial e comece sua jornada de reabilitação conosco.
          </p>
        </section>

        <section id="quem-somos">
          <h1 className="text-3xl font-bold text-vyta-primary-400">
            Quem somos
          </h1>
          <div className="flex flex-col md:flex-row align-center justify-center gap-6  mt-5">
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
              imgSrc="/Taina-2.png"
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
          <h1 className="text-3xl font-bold text-transparent text-vyta-primary-400">
            Localização
          </h1>
          <div className="w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d427.96519633859407!2d-46.66115957244263!3d-23.559992771406215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce592d449e10dd%3A0x9fb98fcb63eab6f4!2sVyta%20Fisioterapia!5e0!3m2!1sen!2sbr!4v1678887676221!5m2!1sen!2sbr"
              width="100%"
              height="450"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        <section
          className="flex flex-col align-center justify-center text-lg"
          id="contato"
        >
          <h1 className="text-3xl font-bold text-transparent text-vyta-primary-400">
            Contato
          </h1>
          <div className="flex flex-col align-baseline gap-6 md:gap-4">
            <a href="tel:+5511989172311" className="flex items-center gap-2">
              <PhoneIcon className="text-vyta-secondary-400 w-8 h-8" />
              <span>(11)98917-2311</span>
            </a>
            <a
              href="/whatsapp"
              className="flex items-center gap-2"
            >
              <WhatsappIcon className="fill-vyta-secondary-400 text-white w-8 h-8" />
              <span>Whatsapp</span>
            </a>
            <a
              href="mailto:contato@vytafisioterapia.com.br"
              className="flex items-center gap-2"
            >
              <EmailIcon className="text-vyta-secondary-400 w-8 h-8" />
              <span>contato@vytafisioterapia.com.br</span>
            </a>
            <a
              className="flex items-center gap-2"
              href="https://instagram.com/vytafisioterapia"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon className="text-white fill-vyta-secondary-400 w-7 h-7" />
              <span>Instagram</span>
            </a>
          </div>
        </section>

        <a
          href="/whatsapp"
          className="fixed bottom-10 right-5 md:bottom-15 md:right-15"
          target="_blank" rel="noopener noreferrer"
        >
          <Image
            src="/whatsapp.png"
            alt="whatsapp icon"
            width={70}
            height={70}
            className="motion-safe:animate-bounce"
          />
        </a>
      </main>

      <footer className="flex flex-col py-4 w-full items-center justify-center border-t gap-2 bg-slate-50">
        <a
          className="flex items-center justify-center text-sm text-vyta-tertiary-700"
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
