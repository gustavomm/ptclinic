import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export type GalleryPhoto = {
  src: string;
  alt: string;
  /** Real intrinsic dimensions of the file, for next/image and CLS prevention. */
  width: number;
  height: number;
};

/*
  Uniform 4:3 tiles, deliberately.

  The first version gave portrait photos `lg:row-span-2` over 260px auto-rows,
  which reads well on paper but cannot pack: with three landscape and three
  portrait photos in three columns, dense flow leaves holes at the foot of every
  column, and each row is sized by its tallest tile so the short ones sit above
  ~280px of dead space. It also breaks differently for any other count or mix,
  so adding a seventh photo would re-rag it.

  Fixed-ratio tiles with object-cover are stable at any count, and the even
  rhythm suits this design better than a masonry that has to be re-tuned by
  hand. These are room photographs, so a centre crop loses nothing.
*/
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
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <Reveal key={photo.src} delay={(i % 3) * 80} className="overflow-hidden">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
