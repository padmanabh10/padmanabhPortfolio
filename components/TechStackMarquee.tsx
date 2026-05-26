"use client";

import { Marquee } from "@/components/Marquee";

interface Tech {
  name: string;
  img: string;
}

const row1: Tech[] = [
  { name: "Python", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "C++", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  { name: "JavaScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "React", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Node.js", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "NestJS", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" },
  { name: "Flask", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
  { name: "SQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg" },
];

const row2: Tech[] = [
  { name: "AWS", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Docker", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Kubernetes", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg" },
  { name: "GitHub Actions", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg" },
  { name: "Linux", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
];

const row3: Tech[] = [
  { name: "MongoDB", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "MySQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "PostgreSQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "Redis", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
  { name: "SQLite", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" },
  { name: "ChromaDB", img: "https://avatar.vercel.sh/chromadb" },
  { name: "Pinecone", img: "https://avatar.vercel.sh/pinecone" },
];

const row4: Tech[] = [
  { name: "LangChain", img: "https://avatar.vercel.sh/langchain" },
  { name: "Claude Code", img: "https://avatar.vercel.sh/claude" },
  { name: "Prompt Engineering", img: "https://avatar.vercel.sh/prompt" },
  { name: "RAG Pipelines", img: "https://avatar.vercel.sh/rag" },
  { name: "LLMs", img: "https://avatar.vercel.sh/llm" },
  { name: "Embeddings", img: "https://avatar.vercel.sh/embeddings" },
];

const row5: Tech[] = [
  { name: "NumPy", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg" },
  { name: "Pandas", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" },
  { name: "Scikit-learn", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg" },
  { name: "TensorFlow", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
];

const rows = [row1, row2, row3, row4, row5];

function TechCard({ name, img }: Tech) {
  return (
    <div className="flex flex-col items-center gap-3 bg-bg-card border border-border rounded-lg px-6 py-5 shrink-0 min-w-[120px] hover:border-primary/50 transition-colors">
      <img
        src={img}
        alt={name}
        width={48}
        height={48}
        className="w-12 h-12 object-contain"
      />
      <span className="font-mono text-[10px] font-bold text-text whitespace-nowrap uppercase tracking-wider">
        {name}
      </span>
    </div>
  );
}

export default function TechStackMarquee() {
  return (
    <div className="relative flex w-full flex-col overflow-hidden gap-4">
      {rows.map((row, i) => (
        <Marquee
          key={i}
          reverse={i % 2 === 1}
          pauseOnHover
          className="[--duration:30s] [--gap:1rem]"
        >
          {row.map((tech) => (
            <TechCard key={tech.name} {...tech} />
          ))}
        </Marquee>
      ))}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}
