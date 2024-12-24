"use client";

import { FC } from "react";
import { z } from "zod";
import { Input } from "../../../components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "../../../components/ui/form";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";

export const contactFormSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Invalid Email",
    }),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name must be at least 3 characters long",
    }),
  subject: z
    .string({
      required_error: "Subject is required",
    })
    .min(3, {
      message: "Subject must be at least 3 characters long",
    }),
  message: z
    .string({
      required_error: "Message is required",
    })
    .min(10, {
      message: "Message must be at least 10 characters long",
    }),
});

export const ContactForm: FC = () => {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    mode: "all",
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: "",
      name: "",
      subject: "",
      message: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof contactFormSchema>) => {
    console.log(data);
    try {
      await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Success", {
        description: "Message sent",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <motion.div
          className="flex justify-between gap-5"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.1 }}
        >
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  <Label className={cn(geistMono.className)}>Email</Label>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  <Label className={cn(geistMono.className)}>Name</Label>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          className="w-full mt-5"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        >
          <FormField
            name="subject"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  <Label className={cn(geistMono.className)}>Subject</Label>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          className="w-full mt-5"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <FormField
            name="message"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Label className={cn(geistMono.className)}>Message</Label>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={10}
                    placeholder="Type your message"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          className="w-full flex justify-end items-center mt-5"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
              geistMono.className
            )}
            type="submit"
          >
            Send Message
          </motion.button>
        </motion.div>
      </motion.form>
    </Form>
  );
};
