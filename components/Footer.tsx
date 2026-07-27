import Telemetry from "./Telemetry";
import { buildYear, deployedAt } from "@/lib/build";

export default function Footer() {
  return (
    <>
      <Telemetry deployedAt={deployedAt} />
      <footer className="footer">
        <span>© {buildYear} Jordan</span>
        <span className="footer__c">↳ Designed &amp; Operated by jd</span>
        <span className="footer__r">
          Built on <span className="lit">AWS</span> · jordandesigns.io
        </span>
      </footer>
    </>
  );
}
