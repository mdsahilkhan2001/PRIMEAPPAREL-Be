// Mock Notification Service
// In production, use Nodemailer for Email and Axios for Meta Cloud API

exports.sendEmail = async (to, subject, html) => {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    // Implementation example:
    // await transporter.sendMail({ from, to, subject, html });
    return true;
};

exports.sendWhatsApp = async (to, templateName, parameters) => {
    console.log(`[MOCK WHATSAPP] To: ${to}, Template: ${templateName}, Params: ${JSON.stringify(parameters)}`);
    // Implementation example:
    // await axios.post('https://graph.facebook.com/v17.0/PHONE_NUMBER_ID/messages', { ... });
    return true;
};
