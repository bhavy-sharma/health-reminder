import nodemailer from "nodemailer";

/**
 * Reusable email sending utility for the Family Health application.
 * Utilizes the existing EMAIL_USER and EMAIL_PASS environment variables.
 * 
 * @param {Object} options 
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content of the email
 * @returns {Promise<boolean>} - Resolves to true if sent successfully, false otherwise.
 */
export const sendEmail = async ({ to, subject, html }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error("[EMAIL ERROR] Missing EMAIL_USER or EMAIL_PASS environment variables.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"Family Health" <${emailUser}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Successfully sent email to ${to} with subject: "${subject}"`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error);
    return false; // Return false to indicate failure without throwing an exception
  }
};
