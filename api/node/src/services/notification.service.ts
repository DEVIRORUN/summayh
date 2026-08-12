import { prisma } from "../utils/prisma";
import { getIO } from "..";
import { resend } from "../utils/resend";
import { NotificationType } from "../../generated/prisma";
import React from "react";

interface NotifyParams {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
    email?: {
        to: string;
        subject: string;
        template: React.ReactElement;
    }
}


export class NotificationService {
    static async notify({ userId, type, title, body, link, email }: NotifyParams) {
        try {
            const notification = await prisma.notification.create({
                data: { userId, type, title, body, link },
            });

            const io = getIO();
            io?.to(`user:${userId}`).emit('notification:new', notification);

            if (email) {
                resend.emails.send({
                    from: "SUMMAYH <notifications@summayh.com>",
                    to: email.to,
                    subject: email.subject,
                    react: email.template,
                }).catch((err) => console.error("[notify] email send failed", err));
            }

            return notification;
        } catch (err: any) {
            throw err;
        }
    } 
}