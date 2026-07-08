export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: "https://mihenks.vercel.app/sitemap.xml"
  };
}
