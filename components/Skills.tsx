import { skills } from "@/lib/site";

export default function Skills() {
  return (
    <section id="skills" className="stage skills">
      <div className="sec-head reveal">
        <span className="sec-head__num">/04</span>
        <h2 className="sec-head__title">Stack</h2>
        <span className="sec-head__meta">
          Tools &amp; languages
          <br />
          Daily-use
        </span>
      </div>
      <div className="skills__grid reveal">
        {skills.map((g) => (
          <div className="skills__group" key={g.label}>
            <div className="label">{g.label}</div>
            <div className="items">
              {g.tags.map((t, i) => (
                <span key={t}>
                  {t}
                  {i < g.tags.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
