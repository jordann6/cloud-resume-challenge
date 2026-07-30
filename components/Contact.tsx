import CalendlyEmbed from "./CalendlyEmbed";

export default function Contact() {
  return (
    <section id="contact" className="stage contact">
      <div className="sec-head reveal">
        <span className="sec-head__num">/07</span>
        <h2 className="sec-head__title">Signal</h2>
        <span className="sec-head__meta">
          Channels
          <br />
          Open
        </span>
      </div>
      <div className="contact__grid reveal">
        <div>
          <h3 className="contact__head">
            Let&apos;s
            <br />
            <span className="out">Build</span>
            <br />
            Something<span className="punct">.</span>
          </h3>
          <p className="contact__sub">
            Open to full-time roles and contract (1099) engagements. Remote, or
            hybrid in Chicago. Book a time below or reach out directly.
          </p>
          <a href="mailto:jordandn6@outlook.com" className="btn btn--primary">
            Send a Signal <span className="arrow">→</span>
          </a>
        </div>
        <div className="contact__links">
          <a className="contact__link" href="mailto:jordandn6@outlook.com">
            <span className="label">/Email</span>
            <span className="val">jordandn6@outlook.com</span>
            <span className="arr">↗</span>
          </a>
          <a
            className="contact__link"
            href="https://www.linkedin.com/in/jordan-nelson-aa0828165/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="label">/LinkedIn</span>
            <span className="val">View Profile</span>
            <span className="arr">↗</span>
          </a>
          <a
            className="contact__link"
            href="https://github.com/jordann6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="label">/GitHub</span>
            <span className="val">github.com/jordann6</span>
            <span className="arr">↗</span>
          </a>
          <a className="contact__link" href="https://jordandesigns.io">
            <span className="label">/Site</span>
            <span className="val">jordandesigns.io</span>
            <span className="arr">↗</span>
          </a>
        </div>
      </div>

      <div className="schedule reveal" style={{ paddingTop: "72px" }}>
        <p className="schedule__intro">
          ↳ Prefer to talk it through? Grab a slot that works for you and I will
          send a calendar invite with a video link.
        </p>
        <CalendlyEmbed />
      </div>
    </section>
  );
}
