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
    <div className="flex flex-col items-center w-[350px] gap-2">
      <div className="relative h-[370px] w-[350px]">
        <Image
          src={imgSrc}
          alt={imgAlt}
          fill={true}
          style={{ objectFit: "contain" }}
          className="bg-slate-100 p-4 rounded-2xl"
        ></Image>
      </div>
      <h3 className="font-serif text-3xl">{name}</h3>
      <div className="text-left px-3">
        {description.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
};
