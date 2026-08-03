import Link from "next/link";
import { projects, featuredProjects } from "@/lib/projects";
import ProjectIndex from "./ProjectIndex";

export default function Projects() {
  return (
    <section id="projects" className="stage proj">
      <div className="sec-head reveal">
        <span className="sec-head__num">/03</span>
        <h2 className="sec-head__title">Selected Work</h2>
        <span className="sec-head__meta">
          Curated builds
          <br />
          {featuredProjects().length} of {projects.length} indexed
        </span>
      </div>

      <ProjectIndex featuredOnly />

      <div className="proj__more reveal">
        <Link href="/work/" className="btn btn--ghost">
          Open Full Index ({projects.length}) <span className="arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
