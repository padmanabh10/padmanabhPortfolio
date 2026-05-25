import type { Metadata } from "next";
import Link from "next/link";
import AboutIntro from "@/components/AboutIntro";

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

const skills = [
  { label: "LANGUAGES & FRAMEWORKS", items: "Python, C++, JavaScript, TypeScript, SQL, React.js, Flask, Node.js, NestJS" },
  { label: "CLOUD & DEVOPS", items: "AWS, Docker, Kubernetes, GitHub Actions, Linux" },
  { label: "DATABASES", items: "MongoDB, MySQL, ChromaDB, Pinecone, Redis, SQLite, PostgreSQL" },
  { label: "AI & LLM", items: "LLMs & Embeddings, RAG Pipelines, Prompt Engineering, LangChain, Claude Code" },
  { label: "ML LIBRARIES", items: "NumPy, Pandas, Scikit-learn, TensorFlow" },
];


function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-6 mb-12">
      <h2 className="font-heading text-5xl uppercase text-primary whitespace-nowrap">
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

      {/* Education */}
      <section className="px-8 md:px-24 py-24 border-t border-border">
        <SectionHeader title="EDUCATION" />
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {education.map((edu) => (
            <li
              key={edu.school}
              className="group bg-bg-card p-8 flex flex-col justify-between min-h-[220px] transition-colors duration-300 hover:bg-primary cursor-default"
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

      {/* Experience */}
      <section className="px-8 md:px-24 py-24 border-t border-border bg-bg-alt">
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

      {/* Technical Skills */}
      <section className="px-8 md:px-24 py-24 border-t border-border">
        <SectionHeader title="TECH STACK" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          {skills.map((row) => (
            <div
              key={row.label}
              className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 border-b border-border pb-4"
            >
              <span className="font-mono text-xs font-bold uppercase text-primary tracking-widest min-w-[170px]">
                {row.label}
              </span>
              <span className="font-mono text-sm text-text leading-relaxed">
                {row.items}
              </span>
            </div>
          ))}
        </div>
      </section>

    </>
  );
}
