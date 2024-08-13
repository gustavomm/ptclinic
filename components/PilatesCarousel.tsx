import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import heroPic from "../public/pilates1.jpeg";
import heroPic2 from "../public/pilates3.jpeg";
import heroPic3 from "../public/pilates2.jpeg";
import heroPic4 from "../public/pilates4.jpeg";

const PilatesCarousel = () => (
  <div className="flex align-center justify-center lg:max-h-70vh lg:w-[70vw] w-[90vw]">
    <Swiper
      navigation={true}
      autoplay={{ delay: 3000 }}
      slidesPerView={"auto"}
      modules={[Navigation, Autoplay, Pagination]}
      pagination={{
        clickable: true,
      }}
    >
      <SwiperSlide className="!w-fit px-2">
        <Image
          src={heroPic}
          alt="foto da sala de pilates"
          className="lg:max-h-[70vh] display-block w-auto h-auto rounded-lg"
        />
      </SwiperSlide>
      <SwiperSlide className="!w-fit px-2">
        <Image
          src={heroPic2}
          alt="foto da sala de pilates 2"
          className="lg:max-h-[70vh] display-block w-auto h-auto rounded-lg"
        />
      </SwiperSlide>
      <SwiperSlide className="!w-fit px-2">
        <Image
          src={heroPic3}
          alt="foto da sala de pilates 3"
          className="lg:max-h-[70vh] display-block w-auto h-auto rounded-lg"
        />
      </SwiperSlide>
      <SwiperSlide className="!w-fit px-2">
        <Image
          src={heroPic4}
          alt="foto da sala de pilates 4"
          className="lg:max-h-[70vh] display-block w-auto h-auto rounded-lg"
        />
      </SwiperSlide>
    </Swiper>
  </div>
);

export default PilatesCarousel;
