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
            After leaving law school, I redirected toward software engineering
            and cloud infrastructure. My work emphasizes{" "}
            <strong>reliability, reproducibility, and operational awareness</strong>{" "}
            across the software development lifecycle.
          </p>
          <p>
            Currently at <strong>Snorkel AI</strong> as a DevOps Engineer,
            running DevSecOps pipelines, Kubernetes blue-green deployments on
            AKS, and event-driven AWS remediation. Independently building Azure
            FinOps tooling, production monitoring, and Zero Trust identity
            infrastructure.
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
