import Image from "next/image";
import React from "react";
import heroPic from "../public/clinica.webp";
import heroPic2 from "../public/clinica2.webp";
import logoPic from "../public/LOGOTIPO 004.webp";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Autoplay } from "swiper/modules";

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
          {/* <h1 className="text-4xl lg:text-5xl pt-12 font-semibold">
            Movimento é VYTA
          </h1> */}
          <p className="pt-6 lg:pt-12 lg:text-xl text-justify">
            Fisioterapia com atendimento especializado, individualizado e
            humanizado, com práticas baseadas em evidências.
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
          <Swiper
            navigation
            autoplay={{ delay: 3000 }}
            modules={[Navigation, Autoplay]}
          >
            <SwiperSlide>
              <Image
                src={heroPic}
                alt="foto da clinica"
                className="lg:max-h-[calc(100vh-76px)]"
              />
            </SwiperSlide>
            <SwiperSlide>
              <Image
                src={heroPic2}
                alt="foto da clinica 2"
                className="lg:max-h-[calc(100vh-76px)]"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Hero;
