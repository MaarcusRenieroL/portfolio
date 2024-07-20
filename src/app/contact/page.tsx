import { ContactForm } from "~/components/contact-form";
import { Header } from "~/components/header";

export default function ContactPage() {
  return (
    <div className="w-full">
      <Header title="Contact" />
      <ContactForm />
    </div>
  );
}
