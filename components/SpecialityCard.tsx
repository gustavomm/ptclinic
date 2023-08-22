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
    <Link href={`speciality/${slug}`}>
      <div className="card h-[500px] lg:h-[620px] bg-base-100">
        <figure>
          <Image src={image} alt={title} width={800} height={600} />
        </figure>
        <div className="card-body items-center gap-3">
          <h2 className="card-title text-2xl">{title} </h2>
          <p>{description}</p>
          <div className="card-actions justify-center">
            <div className="text-vyta-secondary-500">Ver Detalhes ➜</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SpecialityCard;
