import { Header } from "~/components/header";
import { AboutMe } from "~/components/sections/about-me";
import { Services } from "~/components/sections/services";
import { Clients } from "~/components/sections/clients";
import { Testimonials } from "~/components/sections/testimonials";

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
