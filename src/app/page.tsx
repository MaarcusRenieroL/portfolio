import { Button } from "~/components/ui/button"

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-10 flex flex-col gap-10">
      <Button className="w-fit">Hola</Button>
      <p>navbar</p>
      <p>header ( contains name, description, current role, place )</p>
      <p>work experience</p>
      <p>blog</p>
      <p>projects</p>
      <p>footer</p>
    </div>
  );
}
