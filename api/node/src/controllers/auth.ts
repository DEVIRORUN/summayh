import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { checkEduEmail } from "../validators";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password: passwordRaw, name, dateOfBirth, phoneNumber } = req.body;

        // 1. Validate the .edu.ng domain in email
        if (!checkEduEmail(email)) {
            return res.status(400).json({
                error: "Invalid university email. Must the a supported .edu.ng domain."
            });
        }

        // 2. Now we check if user exist in teh database
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phoneNumber }]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                error: "Email or phone number already registered."
            })
        }

        // 3. We Hash the password
        const saltRounds = 12;
        const password = await bcrypt.hash(passwordRaw, saltRounds)

        // 4. Create the user in the database(Postgres)
        const newUser = await prisma.user.create({
            data: {
                email,
                password,
                name,
                university: email.split("@")[1].split(".")[0].toUpperCase,
                dateOfBirth: new Date(dateOfBirth),
                phoneNumber,
                isPhoneVerified: false, // This would be verified later through an OTP process if they choose to buy/sell
            }
        })

        // 5. Fake Termii OTP trigger (I'll wire teh real API later)
        console.log(`[TERMII MOCK] Sending OTP to ${phoneNumber} for user ${email}... (This is a mock, no real OTP sent): ${newUser.id}`);

        // 6. Return success (NOT the pwsd hash)
        return res.status(201).json({
            message: "User registered successfully. OTP sent.",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                university: newUser.university,
                dateOfBirth: newUser.dateOfBirth,
                phoneNumber: newUser.phoneNumber,
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error during registration." });
    }
}

export const loginUser = async (req: Request, res: Response): Promise<any> => {
    try{
        const { email, password } = req.body;

        // 1. Basic vallidation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // 2. Find the user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // 3. Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password. Please input a correct password."
            });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { userid: user.id, email: user.email },
            process.env.JWT_SECRET || "summayh_dev_secret_key_0627",
            { expiresIn: "7d" }
        );

        // 5. Return success
        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                university: user.university
            },
        });
    } catch(error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error during login." });
    }
}