const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const accountApi = new SibApiV3Sdk.AccountApi();

// Verify connection on startup
accountApi.getAccount()
  .then(() => console.log("Brevo mail transporter ready"))
  .catch((error) => console.error("Brevo mail transporter error:", error.message));

const sendMail = async ({ to, subject, html }) => {
  const email = new SibApiV3Sdk.SendSmtpEmail();

  email.sender = { name: "WonderSPA", email: process.env.MAIL_USER };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = html;

  return await apiInstance.sendTransacEmail(email);
};

module.exports = sendMail;