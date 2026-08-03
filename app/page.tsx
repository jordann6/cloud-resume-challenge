import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Capabilities from "@/components/Capabilities";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Certs from "@/components/Certs";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Capabilities />
      <Projects />
      <Skills />
      <Certs />
      <Contact />
    </>
  );
}
