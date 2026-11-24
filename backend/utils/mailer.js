const nodemailer = require("nodemailer");

const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new Error("Configuration SMTP incomplète (SMTP_HOST, SMTP_USER, SMTP_PASS requis).");
    }

    const port = Number(SMTP_PORT) || 587;
    const isSecure = SMTP_SECURE === "true" || port === 465;

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: isSecure,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
};

const sendResetEmail = async (to, resetUrl) => {
    const transporter = createTransporter();
    const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;

    const mailOptions = {
        from: `"HITAS Connect" <${fromAddress}>`,
        to,
        subject: "Réinitialisation de votre mot de passe — HITAS Connect",
        text: [
            "Bonjour,",
            "",
            "Vous avez demandé la réinitialisation de votre mot de passe sur HITAS Connect.",
            `Cliquez sur ce lien pour définir un nouveau mot de passe (valable 15 minutes) : ${resetUrl}`,
            "",
            "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email."
        ].join("\n"),
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                <h2>Réinitialisation de votre mot de passe</h2>
                <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>HITAS Connect</strong>.</p>
                <p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 18px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Réinitialiser mon mot de passe
                    </a>
                </p>
                <p style="font-size: 13px; color: #4b5563;">
                    Ce lien est valable pendant <strong>15 minutes</strong>. Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet email.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendResetEmail
};