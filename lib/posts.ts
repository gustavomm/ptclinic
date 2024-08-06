import { remark } from "remark";
import html from "remark-html";
import { blogPosts } from "../constants/blogPosts";

export async function getPostData(slug: string) {
  blogPost = blogPosts.find((post) => post.slug === slug);
  // Use gray-matter to parse the post metadata section
  const matterResult = matter(blogPost);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
