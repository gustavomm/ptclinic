import Image from "next/image";
import React from "react";
import heroPic from "../public/clinica.jpg";
import heroPic2 from "../public/clinica2.jpg";
import logoPic from "../public/LOGOTIPO 004.png";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="hero min-h-[calc(100vh-76px)] lg:place-items-start">
      <div className="hero-content max-w-full p-0 w-full justify-between flex-col lg:flex-row">
        <div className="p-8 flex flex-col items-center lg:items-start ">
          <Image
            src={logoPic}
            alt="logo Vyta Fisioterapia"
            width={250}
            height={250}
            className=""
          />
          <h1 className="text-4xl lg:text-5xl pt-12 font-semibold">
            Movimento é VYTA
          </h1>
          <p className="pt-6 lg:pt-12 lg:text-xl text-justify">
            Atendimento especializado, individualizado e humanizado, com
            práticas baseadas em evidências.
          </p>
          <div className="pt-4 lg:pt-6">
            <Link href="/#especialidades">
              <button className="btn btn-outline btn-secondary lg:btn-lg mr-3">
                Especialidades
              </button>
            </Link>
            <Link href="/whatsapp">
              <button className="btn btn-primary lg:btn-lg text-white">
                Agendar
              </button>
            </Link>
          </div>
        </div>
        <div className="max-h-[calc(100vh-76px)] w-[90vw] lg:w-[70vw] carousel">
          <div id="heroSlide1" className="carousel-item w-full relative">
            <Image src={heroPic} alt="foto da clinica" />
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <a
                href="#heroSlide2"
                className="btn btn-circle bg-opacity-80 backdrop-blur"
              >
                ❯
              </a>
            </div>
          </div>
          <div id="heroSlide2" className="carousel-item w-full relative">
            <Image src={heroPic2} alt="foto da clinica 2" />
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <a
                href="#heroSlide1"
                className="btn btn-circle bg-opacity-80 backdrop-blur"
              >
                ❮
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
