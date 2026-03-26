import type { MetadataRoute } from 'next';
import { blogPosts, site } from '@/lib/site-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/about', '/gallery', '/blog', '/privacy', '/terms'].map(
    (route) => ({
      url: `${site.url}${route}`,
      lastModified: new Date(),
    })
  );

  const blogRoutes = blogPosts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  return [...routes, ...blogRoutes];
}
