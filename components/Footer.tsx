import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { label: "GITHUB", href: "https://github.com/padmanabh10", icon: "/images/github-light.png" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/padmanabhpk", icon: "/images/linkedin-light.png" },
];

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-border px-4 sm:px-8 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
      <div className="flex items-center gap-4">
        <Link
          href="/padmanabh-login"
          className="font-heading text-sm text-tag-text font-bold hover:underline"
        >
          <span style={{ fontFamily: "system-ui, sans-serif" }}>©</span> 2025 Padmanabh Kulkarni. All Rights Reserved.
        </Link>
      </div>
      <div className="flex items-center gap-6">
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            className="text-tag-text font-bold tracking-wider uppercase hover:underline flex items-center gap-2"
          >
            <Image
              src={link.icon}
              alt=""
              width={14}
              height={14}
              className="object-contain"
            />
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
