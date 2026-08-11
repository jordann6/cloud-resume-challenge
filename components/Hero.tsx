import Link from "next/link";

export default function Hero() {
  return (
    <section id="hero" className="hero stage">
      <div className="hero__top">
        <span className="hero__eyebrow">
          <span className="blink" /> Open to Full-Time &amp; Contract (1099)
        </span>
        <span className="hero__loc">
          <strong>Chicago, IL — USA</strong>
          <br />
          Remote-first
        </span>
      </div>

      <h1 className="hero__name">
        <span className="first">
          Jordan<span className="punct">.</span>
        </span>
      </h1>

      <div className="hero__bottom">
        <div className="hero__role">
          <div className="meta">↳ Discipline</div>
          <div className="title">
            Multi-Cloud
            <br />
            Engineer
          </div>
        </div>
        <div className="hero__desc">
          <span className="meta">↳ Practice</span>
          Platforms, infrastructure, and automation across AWS and Azure.
          AI-integrated systems, cloud security, FinOps, and production
          observability, all defined as code.
        </div>
        <div className="hero__cta">
          <Link href="/#projects" className="btn btn--primary">
            View Work <span className="arrow">→</span>
          </Link>
          <Link href="/#contact" className="btn btn--ghost">
            Schedule a Call <span className="arrow">↗</span>
          </Link>
          <div className="hero__reach">
            <span className="meta">↳ Reach me</span>
            <div className="hero__reach-links">
              <a href="mailto:jordandn6@outlook.com">jordandn6@outlook.com</a>
              <span className="sep">·</span>
              <a
                href="https://www.linkedin.com/in/jordan-nelson-aa0828165/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <span className="sep">·</span>
              <a
                href="https://github.com/jordann6"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
