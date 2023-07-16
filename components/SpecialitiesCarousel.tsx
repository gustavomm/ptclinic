import React from "react";
import specialities from "../constants/specialities";
import SpecialityCard from "./SpecialityCard";

const SpecialitiesCarousel = () => {
  return (
    <div className="carousel carousel-center max-w-sm lg:max-w-2xl p-4 space-x-4 bg-neutral-400 rounded-box">
      {Object.values(specialities).map((speciality, index) => (
        <div
          key={index}
          id={`slide${index}`}
          className="carousel-item relative"
        >
          <SpecialityCard
            title={speciality.title}
            image={speciality.image}
            description={speciality.description}
            slug={speciality.slug}
          />
          <div className="invisible lg:visible absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
            <a
              href={index === 0 ? "#slide0" : `#slide${index - 1}`}
              className="btn btn-circle bg-opacity-80 backdrop-blur"
            >
              ❮
            </a>
            <a
              href={index === 7 ? "#slide7" : `#slide${index + 1}`}
              className="btn btn-circle bg-opacity-80 backdrop-blur"
            >
              ❯
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecialitiesCarousel;
