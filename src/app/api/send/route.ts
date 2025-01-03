import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { email, name, subject, message } = await request.json();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL!,
      to: process.env.MY_EMAIL!,
      replyTo: email,
      subject: name + " " + subject,
      text: "From: " + email + "\n\n" + message,
    });

    if (error) {
      console.log(error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
