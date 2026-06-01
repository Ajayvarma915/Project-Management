import MailGen from 'mailgen'
import nodeMailer from 'nodemailer'

const sendEmail=async (options)=>{
    const mailGenerator=new MailGen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagerlink.com",
        },
    })

    const emailTextual=mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml=mailGenerator.generate(options.mailgenContent);

    const transporter=nodeMailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail={
        from:"mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailTextual,
        html:emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service Failed.This might happen because of the credential.Make sure all the MailTrap credentials were correct")
        console.error("Error: ",error)
    }
}

const emailVerificationMailGen=(username,emailVerificationUrl)=>{
    return {
        body:{
            name:username,
            intro:"Welcome to our App! We are excited to have you onboard.",
            action:{
                instructions:"To verify your email, Please click on the below button.",
                button:{
                    color:"#22BC66",
                    text:"Verify your email",
                    link:emailVerificationUrl
                }
            },
            outro:"Need help, or have questions? Just reply to this Email, we'd love to help."
        }
    }
}


const forgotPasswordMailGen=(username,passwordResetUrl)=>{
    return {
        body:{
            name:username,
            intro:"We got a request to reset the password of your account",
            action:{
                instructions:"To reset your password, Please click on the below button.",
                button:{
                    color:"#22BC66",
                    text:"Reset your password",
                    link:passwordResetUrl
                }
            },
            outro:"Need help, or have questions? Just reply to this Email, we'd love to help."
        }
    }
}


export{
    emailVerificationMailGen,
    forgotPasswordMailGen,
    sendEmail
};