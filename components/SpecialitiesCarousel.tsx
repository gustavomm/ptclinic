import React from "react";
import specialities from "../constants/specialities";
import SpecialityCard from "./SpecialityCard";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";

import { Autoplay, EffectCards } from "swiper/modules";

const SpecialitiesCarousel = () => {
  return (
    <Swiper
      effect={"cards"}
      grabCursor={true}
      modules={[EffectCards, Autoplay]}
      className="w-[80vw] lg:w-[700px] overflow-visible"
      autoplay={{
        delay: 2500,
        disableOnInteraction: true,
      }}
      rewind={true}
    >
      {Object.values(specialities).map((speciality, index) => (
        <SwiperSlide key={index} className="rounded-2xl shadow-xl">
          <SpecialityCard
            title={speciality.title}
            image={speciality.image}
            description={speciality.description}
            slug={speciality.slug}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SpecialitiesCarousel;
