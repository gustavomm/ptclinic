import Image from "next/image";

export const StaffProfile = ({
  imgSrc,
  name,
  imgAlt,
  description,
}: {
  imgSrc: string;
  name: string;
  imgAlt: string;
  description: string[];
}) => {
  return (
    <div className="flex flex-col items-center w-[350px] gap-4">
      <div className="relative h-[370px] w-[285px] overflow-hidden rounded-2xl">
        <Image
          src={imgSrc}
          alt={imgAlt}
          fill={true}
          style={{ objectFit: "contain" }}
          className=""
        ></Image>
      </div>
      <h3 className="text-2xl text-primary-400 font-bold">{name}</h3>
      <ul className="text-left px-3 text-vyta-tertiary-900 list-disc">
        {description.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </div>
  );
};
