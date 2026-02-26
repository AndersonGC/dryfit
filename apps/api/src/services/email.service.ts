import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationCode(to: string, code: string) {
    let finalTransporter = this.transporter;

    if (!process.env.SMTP_USER) {
      // Fallback to ethereal email for local testing if no credentials are provided
      const testAccount = await nodemailer.createTestAccount();
      finalTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: '"DryFit App" <noreply@dryfit.app>',
      to,
      subject: 'Seu Código de Verificação DryFit',
      text: `Olá!\n\nSeu código de verificação é: ${code}\n\nEste código expira em 15 minutos.\n\nSe você não solicitou este código, ignore este e-mail.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verificação de E-mail</h2>
          <p>Olá,</p>
          <p>Você iniciou o processo de criação de conta no aplicativo <strong>DryFit</strong>.</p>
          <p>Por favor, utilize o código abaixo para confirmar seu e-mail:</p>
          <div style="background-color: #f4f4f5; padding: 24px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${code}</span>
          </div>
          <p>Este código expira em 15 minutos.</p>
          <p style="color: #71717a; font-size: 14px; margin-top: 48px;">Se você não solicitou este código, pode ignorar este e-mail com segurança.</p>
        </div>
      `,
    };

    const info = await finalTransporter.sendMail(mailOptions);
    
    if (!process.env.SMTP_USER) {
       console.log('💌 PREVIEW URL (Ethereal): %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  }
}
