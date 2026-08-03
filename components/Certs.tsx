import { certs } from "@/lib/site";

export default function Certs() {
  return (
    <section id="certs" className="stage certs">
      <div className="sec-head reveal">
        <span className="sec-head__num">/05</span>
        <h2 className="sec-head__title">Certified</h2>
        <span className="sec-head__meta">
          Credentials
          <br />
          Active 2026
        </span>
      </div>
      <div className="certs__grid reveal">
        {certs.map((c) => (
          <div className="cert" key={c.sigil + c.sub}>
            <div className="cert__top">
              <div className="cert__sigil">
                {c.sigil}
                <span className="sub">{c.sub}</span>
              </div>
              <span
                className={`cert__status${c.status === "Expired" ? " expired" : ""}${c.status === "In Progress" ? " progress" : ""}`}
              >
                <span className="dot" />
                {c.status}
              </span>
            </div>
            <div className="cert__bottom">
              <div className="cert__name">{c.name}</div>
              <div className="cert__provider">{c.provider}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
