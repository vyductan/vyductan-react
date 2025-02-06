"use server";

import nodemailer from "nodemailer";

import type { SendMailParams } from "./types";
import { env } from "../../env";

const ADMIN_EMAIL_ADDRESS = "vdt5snet@gmail.com";

export async function sendMailAction(input: SendMailParams) {
  const { email, name, message } = input;
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ADMIN_EMAIL_ADDRESS,
      pass: env.GOOGLE_APP_PASSWORD,
    },
  });

  return await transport.sendMail({
    to: ADMIN_EMAIL_ADDRESS,
    subject: `Contact from VyDuctan`,
    html: `<div>
                 <b>Contact:</b> ${name} - ${email}
              </div>
              <p>
                <b>Message</b>: ${message}
              </p>
              <a href="#">VyDucTan</a>`,
  });
}
