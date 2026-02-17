export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Oat",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Shotlinks",
      href: "/shotlinks",
    },
    {
      label: "QR Generate",
      href: "/qrgenerate",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Login",
      href: "/login",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Shotlinks",
      href: "/shotlinks",
    },
    {
      label: "QR Generate",
      href: "/qrgenerate",
    },
    {
      label: "Blog",
      href: "/blog",
    },
  ],
  adminNavItems: [
    {
      label: "Posts",
      href: "/admin/posts",
    },
    {
      label: "Categories",
      href: "/admin/categories",
    },
    {
      label: "Tags",
      href: "/admin/tags",
    },
  ],
  links: {
    // github: "https://github.com/heroui-inc/heroui",
    // twitter: "https://twitter.com/hero_ui",
    // docs: "https://heroui.com",
    // discord: "https://discord.gg/9b6yyZKmH4",
    // sponsor: "https://patreon.com/jrgarciadev",
  },
};
