import Head from "next/head";
import { useRouter } from "next/router";
import specialities from "../../constants/specialities";
import Navbar from "../../components/Navbar";
import Image from "next/image";

const MyPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  // Define the title and description based on the slug
  const title = specialities[slug as keyof typeof specialities].title;
  const description =
    specialities[slug as keyof typeof specialities].description;
  const image = specialities[slug as keyof typeof specialities].image;
  const fullDescription =
    specialities[slug as keyof typeof specialities].fullDescription;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <Navbar />

      <main className="flex w-full flex-1 flex-col mt-20 pb-20 px-6">
        <section className="flex flex-col gap-6 items-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-400 mt-6 self-center">
            {title}
          </h1>
          <Image
            src={image}
            alt={title}
            width={800}
            height={600}
            className="rounded-xl"
          />
          <div className="lg:max-w-3xl">
            <h2 className="text-2xl font-semibold mb-3 text-vyta-secondary-500">
              Para quem funciona:
            </h2>
            <ul className="list-disc">
              {fullDescription.patientList.map((line, index) => (
                <li className="mb-2 ml-3" key={index}>
                  {line}
                </li>
              ))}
            </ul>
            <h2 className="text-2xl font-semibold mb-3 text-vyta-secondary-500 mt-6 mb-3">
              Como funciona:
            </h2>
            <p className="text-justify">{fullDescription.howItWorks}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export async function getStaticPaths() {
  return {
    paths: [
      { params: { slug: specialities.neurofuncional.slug } },
      { params: { slug: specialities.oncologica.slug } },
      { params: { slug: specialities.ortopedica.slug } },
      { params: { slug: specialities.gerontologia.slug } },
      { params: { slug: specialities["condicionamento-fisico"].slug } },
      { params: { slug: specialities.respiratoria.slug } },
      { params: { slug: specialities["saude-mulher-homem"].slug } },
      { params: { slug: specialities["drenagem-linfatica"].slug } },
    ],
    fallback: false,
  };
}

export const getStaticProps = () => {
  return {
    props: {},
  };
};

export default MyPage;
