// lib/emailTemplates.js

const baseHtml = (content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
    <h2 style="color: #0D1B2A; text-align: center; font-family: serif; margin-bottom: 20px;">Family Health</h2>
    <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
    ${content}
    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">© ${new Date().getFullYear()} Family Health. All rights reserved.</p>
  </div>
`;

export const getDoctorApprovalEmailTemplate = ({ name, loginUrl }) => {
  const content = `
    <h3 style="color: #10B981;">Congratulations, ${name}!</h3>
    <p style="color: #333; line-height: 1.6;">We are thrilled to inform you that your doctor profile has been successfully verified and approved.</p>
    <p style="color: #333; line-height: 1.6;">You can now log in to your dashboard to complete your profile, manage your availability, and start receiving appointments from patients.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background-color: #0D1B2A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Dashboard</a>
    </div>
    <p style="color: #666; font-size: 14px; margin-top: 20px;">If you have any questions, please feel free to reach out to our support team.</p>
  `;
  return baseHtml(content);
};

export const getDoctorRejectionEmailTemplate = ({ name, reason, profileUrl }) => {
  const content = `
    <h3 style="color: #EF4444;">Hello ${name},</h3>
    <p style="color: #333; line-height: 1.6;">Thank you for registering with Family Health. We have reviewed your doctor profile application.</p>
    <p style="color: #333; line-height: 1.6;">Unfortunately, we could not approve your profile at this time. Our administration team has provided the following remarks regarding your application:</p>
    <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
      <p style="margin: 0; color: #7F1D1D; font-style: italic;">"${reason || 'Please provide additional verification documents.'}"</p>
    </div>
    <p style="color: #333; line-height: 1.6;">Please log in to your account and update the required information or certificates as requested.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${profileUrl}" style="background-color: #0D1B2A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Update Profile</a>
    </div>
  `;
  return baseHtml(content);
};

export const getForgotPasswordEmailTemplate = ({ name, otpCode }) => {
  const content = `
    <p style="color: #333; line-height: 1.6;">Hello ${name},</p>
    <p style="color: #333; line-height: 1.6;">We received a request to reset your password. Please use the verification code below to proceed with the reset:</p>
    <div style="background-color: #f7f4ef; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
      <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0D1B2A;">${otpCode}</span>
    </div>
    <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
  `;
  return baseHtml(content);
};
