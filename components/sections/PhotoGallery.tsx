import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export type GalleryPhoto = {
  src: string;
  alt: string;
  orientation: "landscape" | "portrait";
  /** Real intrinsic dimensions of the file, used for next/image's width/height and CLS prevention. */
  width: number;
  height: number;
};

export function PhotoGallery({
  photos,
  heading,
  tone = "surface",
}: {
  photos: GalleryPhoto[];
  heading: string;
  tone?: "surface" | "surface-alt";
}) {
  return (
    <Section tone={tone}>
      <SectionHeading title={heading} />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-flow-row-dense lg:auto-rows-[260px] lg:grid-cols-3">
        {photos.map((photo, i) => (
          <Reveal
            key={photo.src}
            delay={(i % 3) * 80}
            className={`overflow-hidden ${photo.orientation === "portrait" ? "lg:row-span-2" : ""}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full lg:h-full lg:w-full lg:object-cover"
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
