"use client";

import { motion } from "framer-motion";
import { ContactForm } from "./_components/contact-form";
import { Header } from "~/components/header";

export default function ContactPage() {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <Header title="Contact" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mt-10"
      >
        <ContactForm />
      </motion.div>
    </div>
  );
}
