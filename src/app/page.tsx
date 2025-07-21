import { Navbar } from "~/components/layouts/navbar"
import { Header } from "~/components/sections/header"

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 p-5 md:p-10">
      <Navbar />
      <Header />
      <p>work experience</p>
      <p>blog</p>
      <p>projects</p>
      <p>footer</p>
    </div>
  );
}
