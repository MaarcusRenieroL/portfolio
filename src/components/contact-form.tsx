"use client";

import { FC } from "react";
import { z } from "zod";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { sendEmail } from "~/lib/mail";

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
        <div className="flex justify-between gap-5">
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  <Label>Email</Label>
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
                  <Label>Name</Label>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="subject"
          control={form.control}
          render={({ field }) => (
            <FormItem className="w-full mt-5">
              <FormLabel>
                <Label>Subject</Label>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter your subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full mt-5">
          <FormField
            name="message"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Label>Message</Label>
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
        </div>
        <div className="w-full flex justify-end items-center mt-5">
          <Button type="submit">Send Message</Button>
        </div>
      </form>
    </Form>
  );
};
