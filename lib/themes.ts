export interface ThemeImages {
  logo: string;
  github: string;
  linkedin: string;
  rightArrow: string;
  airTransport: string;
  buildings: string;
  favicon: string;
}

export interface Theme {
  id: string;
  name: string;
  vars: Record<string, string>;
  images: ThemeImages;
}

export const themes: Theme[] = [
  {
    id: "green",
    name: "Green",
    vars: {
      "--color-bg": "#EBFFE6",
      "--color-bg-alt": "#E5F9E0",
      "--color-bg-card": "#EBFFE6",
      "--color-surface": "#D4E8D0",
      "--color-primary": "#006C53",
      "--color-primary-dark": "#006A65",
      "--color-text": "#0F1F10",
      "--color-text-secondary": "#3D4A44",
      "--color-text-muted": "rgba(0, 108, 83, 0.6)",
      "--color-border": "rgba(187, 202, 194, 0.3)",
      "--color-border-accent": "rgba(187, 202, 194, 0.2)",
      "--color-accent-bg": "rgba(0, 106, 101, 0.1)",
      "--color-tag-bg": "#006C53",
      "--color-tag-text": "#FFFFFF",
      "--color-hero-grid": "rgba(64, 201, 162, 0.125)",
    },
    images: {
      logo: "/images/logo-green.png",
      github: "/images/github-green.png",
      linkedin: "/images/linkedin-green.png",
      rightArrow: "/images/right-arrow-green.png",
      airTransport: "/images/air-transport-green.png",
      buildings: "/images/buildings-couple-green.png",
      favicon: "/images/icon-green.png",
    },
  },
  {
    id: "sky",
    name: "Sky",
    vars: {
      "--color-bg": "#EEF2FF",
      "--color-bg-alt": "#E6ECFE",
      "--color-bg-card": "#EEF2FF",
      "--color-surface": "#DAE2FB",
      "--color-primary": "#2563EB",
      "--color-primary-dark": "#1D4ED8",
      "--color-text": "#0F1529",
      "--color-text-secondary": "#3A4A6A",
      "--color-text-muted": "rgba(37, 99, 235, 0.6)",
      "--color-border": "rgba(147, 165, 220, 0.3)",
      "--color-border-accent": "rgba(147, 165, 220, 0.2)",
      "--color-accent-bg": "rgba(37, 99, 235, 0.08)",
      "--color-tag-bg": "#2563EB",
      "--color-tag-text": "#FFFFFF",
      "--color-hero-grid": "rgba(99, 145, 235, 0.125)",
    },
    images: {
      logo: "/images/logo-sky.png",
      github: "/images/github-sky.png",
      linkedin: "/images/linkedin-sky.png",
      rightArrow: "/images/right-arrow-sky.png",
      airTransport: "/images/air-transport-sky.png",
      buildings: "/images/buildings-couple-sky.png",
      favicon: "/images/icon-sky.png",
    },
  },
  {
    id: "rose",
    name: "Rose",
    vars: {
      "--color-bg": "#FFF0F8",
      "--color-bg-alt": "#FFE8F4",
      "--color-bg-card": "#FFF0F8",
      "--color-surface": "#F9D6EA",
      "--color-primary": "#C2185B",
      "--color-primary-dark": "#880E4F",
      "--color-text": "#1A0510",
      "--color-text-secondary": "#4A1A30",
      "--color-text-muted": "rgba(194, 24, 91, 0.6)",
      "--color-border": "rgba(210, 160, 185, 0.4)",
      "--color-border-accent": "rgba(210, 160, 185, 0.25)",
      "--color-accent-bg": "rgba(194, 24, 91, 0.08)",
      "--color-tag-bg": "#C2185B",
      "--color-tag-text": "#FFFFFF",
      "--color-hero-grid": "rgba(194, 24, 91, 0.1)",
    },
    images: {
      logo: "/images/logo-rose.png",
      github: "/images/github-rose.png",
      linkedin: "/images/linkedin-rose.png",
      rightArrow: "/images/right-arrow-rose.png",
      airTransport: "/images/air-transport-rose.png",
      buildings: "/images/buildings-couple-rose.png",
      favicon: "/images/icon-rose.png",
    },
  },
];

export const DEFAULT_THEME_ID = "green";

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
