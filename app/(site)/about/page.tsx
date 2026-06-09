import type { Metadata } from "next";
import Link from "next/link";
import AboutIntro from "@/components/AboutIntro";
import ActivityCalendar from "@/components/ActivityCalendar";
import PlaneExplosion from "@/components/PlaneExplosion";
import SurpriseButton from "@/components/SurpriseButton";

export const metadata: Metadata = { title: "About" };

const education = [
  {
    school: "Walchand Institute of Technology",
    degree: "B.Tech. Electronics and Computer Engineering",
    detail: "CGPA: 9.56 / 10",
    period: "NOV 2022 - JUN 2026",
  },
  {
    school: "Shanti Jr. College of Science",
    degree: "Higher Secondary Certificate (HSC)",
    detail: "Percentage: 90.1%",
    period: "2021",
  },
  {
    school: "Kendriya Vidyalaya Solapur",
    degree: "Secondary School Certificate (SSC)",
    detail: "Percentage: 95%",
    period: "2019",
  },
];

const experience = [
  {
    role: "Backend Developer Intern",
    company: "Soul Yatri",
    companyUrl: "https://www.soulyatri.com/home",
    period: "DEC 2025 - MAY 2026",
    bullets: [
      "Architected a cloud-native backend using NestJS microservices and Docker on AWS ECS, structuring authentication, booking, practitioner workflows, admin tooling, and event-driven services across 10+ core modules.",
      "Implemented secure APIs and data pipelines with JWT/OAuth, MongoDB, Redis for caching and rate limiting.",
    ],
  },
];


const techs = [
  { name: "Python", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "C++", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  { name: "JavaScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "React", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Node.js", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "NestJS", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" },
  { name: "Flask", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
  { name: "SQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg", hideOnMobile: true },
  { name: "AWS", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Docker", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Kubernetes", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg" },
  { name: "GitHub Actions", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg" },
  { name: "Linux", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
  { name: "MongoDB", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "MySQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "PostgreSQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "Redis", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
  { name: "SQLite", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" },
  { name: "NumPy", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg" },
  { name: "Pandas", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" },
  { name: "Scikit-learn", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg" },
  { name: "TensorFlow", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
  { name: "LangChain", img: "/images/LangChain_Logo.png" },
  { name: "Claude Code", img: "/images/claude.png" },
  { name: "ChromaDB", img: "/images/Chroma--Streamline-Svg-Logos.png" },
  { name: "Pinecone", img: "/images/Pinecone-Full-Logo-Black.svg.png" },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mb-8 sm:mb-12">
      <h2 className="font-heading text-3xl sm:text-5xl uppercase text-primary whitespace-nowrap text-center sm:text-left">
        {title}
      </h2>
      <div className="flex-1 h-0.5 bg-primary/30 hidden md:block" />
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <AboutIntro />

      <section className="px-4 sm:px-8 md:px-24 py-12 sm:py-24 border-t border-border">
        <SectionHeader title="EDUCATION" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-border">
          {education.map((edu) => (
            <li
              key={edu.school}
              className="group bg-bg-card p-5 sm:p-8 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] transition-colors duration-300 hover:bg-primary cursor-default"
            >
              <div>
                <span className="font-mono text-sm font-bold text-text-muted tracking-widest transition-colors duration-300 group-hover:text-tag-text/70">
                  {edu.period}
                </span>
                <h3 className="font-heading text-2xl uppercase text-text mt-3 leading-tight transition-colors duration-300 group-hover:text-tag-text">
                  {edu.school}
                </h3>
                <p className="font-mono text-sm text-text-secondary mt-3 leading-relaxed transition-colors duration-300 group-hover:text-tag-text/80">
                  {edu.degree}
                </p>
              </div>
              <p className="font-mono text-base font-bold text-primary tracking-wider mt-6 transition-colors duration-300 group-hover:text-tag-text">
                {edu.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 sm:px-8 md:px-24 py-12 sm:py-24 border-t border-border bg-bg-alt">
        <SectionHeader title="EXPERIENCE" />
        <div className="flex flex-col gap-8">
          {experience.map((exp) => (
            <article
              key={exp.company + exp.role}
              className="bg-bg-card border border-border p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-6">
                <div>
                  <h3 className="font-heading text-3xl uppercase text-text">
                    {exp.role}
                  </h3>
                  <a
                    href={exp.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-primary font-bold tracking-wider mt-2 inline-block hover:underline"
                  >
                    @ {exp.company.toUpperCase()}
                  </a>
                </div>
                <span className="font-mono text-sm font-bold text-text-muted tracking-widest">
                  {exp.period}
                </span>
              </div>
              <ul className="space-y-4">
                {exp.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="font-mono text-sm md:text-base text-text-secondary leading-relaxed flex gap-4"
                  >
                    <span className="text-primary font-bold shrink-0">◇</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="tech-stack" className="relative overflow-hidden px-4 sm:px-8 md:px-24 py-12 sm:py-24 border-t border-border">
        <PlaneExplosion />
        <SectionHeader title="TECH STACK" />
        <div className="relative -mx-4 sm:mx-0">
          <img
            src="/images/buildings-couple.png"
            alt=""
            className="sm:hidden absolute inset-0 w-full h-full object-fill opacity-10 pointer-events-none select-none z-[1]"
          />
          <div className="relative z-10 grid grid-cols-2 gap-x-0 gap-y-3 justify-items-center w-3/4 mx-auto sm:w-full sm:flex sm:flex-wrap sm:justify-center">
          {techs.map((tech) => (
            <div
              key={tech.name}
              className={`flex flex-col items-center gap-2 bg-transparent border-0 px-2 py-3 sm:flex-row sm:gap-3 sm:bg-bg-card sm:border sm:border-border sm:rounded-lg sm:px-4 sm:py-3 sm:hover:border-primary/50 transition-colors${'hideOnMobile' in tech && tech.hideOnMobile ? ' hidden sm:flex' : ''}`}
            >
              <img
                src={tech.img}
                alt={tech.name}
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
              />
              <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
                {tech.name}
              </span>
            </div>
          ))}
          </div>
        </div>
        <SurpriseButton />
      </section>

      <section className="px-4 sm:px-8 md:px-24 py-12 sm:py-24 border-t border-border bg-bg-alt">
        <SectionHeader title="ACTIVITY" />
        <ActivityCalendar />
      </section>

    </>
  );
}
