export default function About() {
  return (
    <section id="about" className="stage">
      <div className="sec-head reveal">
        <span className="sec-head__num">/01</span>
        <h2 className="sec-head__title">About</h2>
        <span className="sec-head__meta">
          Origin / Practice
          <br />
          Scope of Work
        </span>
      </div>
      <div className="about reveal">
        <div className="about__body">
          <p>
            I build cloud platforms and the automation around them: AWS and
            Azure infrastructure, security tooling, and AI-integrated systems,
            all defined as code. My work emphasizes{" "}
            <strong>reliability, reproducibility, and operational awareness</strong>{" "}
            across the software development lifecycle.
          </p>
          <p>
            Every project here was <strong>deployed against real cloud
            accounts, demonstrated live, and torn down clean</strong>, with the
            receipts written up. The case studies cover the architecture
            decisions, the trade-offs, and the bugs that only show up in
            production.
          </p>
          <div className="stats">
            <div className="stat">
              <div className="n">5+</div>
              <div className="l">YRS Cloud</div>
            </div>
            <div className="stat">
              <div className="n">03</div>
              <div className="l">Certs · SAA Active</div>
            </div>
            <div className="stat">
              <div className="n">2×</div>
              <div className="l">AWS · Azure</div>
            </div>
            <div className="stat">
              <div className="n">AI</div>
              <div className="l">Infra · Integration</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
