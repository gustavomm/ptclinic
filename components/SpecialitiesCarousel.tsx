import React from "react";
import specialities from "../constants/specialities";
import SpecialityCard from "./SpecialityCard";
import Slider from "react-slick";

const settings = {
  infinite: true,
  speed: 500,
  autoPlay: false,
  slidesToShow: 1,
  centerMode: true,
  variableWidth: true,
  dots: true,
};

const SpecialitiesCarousel = () => {
  return (
    <Slider
      className="max-w-sm lg:max-w-[80vw] h-[36rem] lg:h-[40rem] py-4 bg-slate-300 rounded-box"
      {...settings}
    >
      {Object.values(specialities).map((speciality, index) => (
        <div key={index} className="h-full mx-2" id={`slide${index}`}>
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
