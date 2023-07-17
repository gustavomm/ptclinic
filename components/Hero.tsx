import Image from "next/image";
import React from "react";
import heroPic from "../public/clinica.webp";
import heroPic2 from "../public/clinica2.webp";
import logoPic from "../public/LOGOTIPO 004.webp";
import Link from "next/link";
import Slider from "react-slick";

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  arrows: true,
  dots: true,
};

const Hero = () => {
  ("");
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
        <div className="lg:max-h-[calc(100vh-76px)] w-[90vw] lg:w-[50vw]">
          <Slider {...settings}>
            <div id="heroSlide1" className="">
              <Image
                src={heroPic}
                alt="foto da clinica"
                className="lg:max-h-[calc(100vh-76px)]"
              />
            </div>
            <div id="heroSlide2" className="">
              <Image
                src={heroPic2}
                alt="foto da clinica 2"
                className="lg:max-h-[calc(100vh-76px)]"
              />
            </div>
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Hero;
