import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from 'nodemailer'
import { MailOptions } from "nodemailer/lib/json-transport";

@Injectable()
export class MailService {
    private transport : nodemailer.Transporter;

    constructor(private configService : ConfigService){
        this.transport = nodemailer.createTransport({
            host: configService.get('ETHEREAL_HOST') as string,
            port : configService.get('ETHEREAL_PORT') as number, 
            auth : {
                user : configService.get('ETHEREAL_USER') as string,
                pass : configService.get('ETHEREAL_PASS') as string
            }
        })
    };

    async sendPasswordResetEmail(to : string , token : string){
        const resetLink = `http://localhost:4000/auth/reset-token?token=${token}`;
        const mailOptions : MailOptions = {
            from: 'Auth Backend service',
            to : to,
            subject : 'Password Reset Request',
            html : `<p>You requested a password reset. Click the link blew to reset your password: <a href="${resetLink}" >Link</a> </p>`
        };

        await this.transport.sendMail(mailOptions)

    }
}