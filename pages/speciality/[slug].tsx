import Head from "next/head";
import { useRouter } from "next/router";
import specialities from "../../constants/specialities";
import Navbar from "../../components/Navbar";

const MyPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  // Define the title and description based on the slug
  const title = specialities[slug as keyof typeof specialities].title;
  const description =
    specialities[slug as keyof typeof specialities].description;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center mt-20 pb-20">
        <section>
          <h1 className="text-3xl font-bold text-vyta-primary-400">{title}</h1>
          <p>{description}</p>
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
