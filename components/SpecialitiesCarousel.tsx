import React from "react";
import specialities from "../constants/specialities";
import SpecialityCard from "./SpecialityCard";
import Slider from "react-slick";

const settings = {
  infinite: true,
  speed: 500,
  autoPlay: true,
  slidesToShow: 1,
  centerMode: true,
  loop: true,
  arrows: true,
  dots: true,
  centerPadding: "25px",
};

const SpecialitiesCarousel = () => {
  return (
    <Slider
      className="max-w-sm lg:max-w-2xl py-4 bg-neutral-400 rounded-box"
      {...settings}
    >
      {Object.values(specialities).map((speciality, index) => (
        <div key={index} className="h-full" id={`slide${index}`}>
          <SpecialityCard
            title={speciality.title}
            image={speciality.image}
            description={speciality.description}
            slug={speciality.slug}
          />
        </div>
      ))}
    </Slider>
  );
};

export default SpecialitiesCarousel;
