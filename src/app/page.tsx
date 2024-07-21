import { Header } from "~/components/header";
import { AboutMe } from "./_components/about-me";
import { Services } from "./_components/services";
import { Testimonials } from "./_components/testimonials";
import { Clients } from "./_components/clients";

export default function Home() {
  return (
    <div className="w-full">
      <Header title="About Me" />
      <div className="space-y-10 w-full">
        <AboutMe />
        <Services />
        <Testimonials />
        <Clients />
      </div>
    </div>
  );
}
