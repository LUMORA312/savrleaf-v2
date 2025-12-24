// send activation link to user with email using Resend
import { Resend } from 'resend';
import User from '../models/User.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const resend = new Resend(process.env.RESEND_API_KEY);

//generate a random activation token
const generateActivationToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

//save the activation token to the database
const saveActivationToken = async (email, activationToken) => {
    const user = await User.findOne({ email });
    if (user) {
        user.activationToken = activationToken;
        user.expirationTime = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
        await user.save();
    }
}

const generateActivationLink = (activationToken) => {
    return `${process.env.FRONTEND_URL}/activate?token=${activationToken}`;
}

const sendActivationLink = async (email, activationLink) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: email,
            subject: 'Activate Your Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome! Activate Your Account</h2>
                    <p>Thank you for signing up. Please click the link below to activate your account:</p>
                    <p style="margin: 30px 0;">
                        <a href="${activationLink}" 
                           style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Activate Account
                        </a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${activationLink}</p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        This link will expire in 24 hours.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw error;
        }

        console.log('Activation email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending activation link', error);
        throw error;
    }
}

export { sendActivationLink, generateActivationToken, generateActivationLink, saveActivationToken };