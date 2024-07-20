import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { email, name, subject, message } = await request.json();

  try {
    const { data, error } = await resend.emails.send({
      from: email,
      to: "maarcusreniero.l@gmail.com",
      subject: name + " " + subject,
      text: message,
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
