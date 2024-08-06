import { NextPage } from "next";
import Navbar from "../components/Navbar";

const Blog: NextPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center w-screen overflow-x-clip">
    <Navbar />
  </div>
);

export const getStaticProps = () => {
  return {
    props: {},
  };
};

export default Blog;
