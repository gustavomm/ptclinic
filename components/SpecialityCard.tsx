import Image from "next/image";
import Link from "next/link";
import React from "react";

const SpecialityCard = ({
  title,
  image,
  description,
  slug,
}: {
  title: string;
  image: string;
  description: string;
  slug: string;
}) => {
  return (
    <div className="card w-80 h-[34rem] lg:h-[38rem] lg:w-[36rem] bg-base-100">
      <figure>
        <Image src={image} alt={title} width={800} height={600} />
      </figure>
      <div className="card-body items-center gap-3">
        <h2 className="card-title text-2xl">{title} </h2>
        <p>{description}</p>
        <div className="card-actions justify-center">
          <Link
            href={`speciality/${slug}`}
            className="btn btn-primary text-white"
          >
            Detalhes➜
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpecialityCard;
