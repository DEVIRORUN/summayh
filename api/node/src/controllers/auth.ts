import { Request, Response } from "express";
import { AuthRequest } from "../middleware/AuthRequest"
import { prisma } from "../utils/prisma";
import { isValidEduEmail } from "../validators";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const checkEduEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
        return res.status(400).json({
            message: "Email is required."
        });
    }

    // Use validator here
    if (!isValidEduEmail(email)) {
        return res.status(400).json({
            isValid: false,
            message: "Email is not a valid .edu.ng email. Not from an approved Nigerian university."
        });
    }

    // Check if its existing in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        isValid: false, 
        message: "This email is already registered." 
      });
    }

    return res.status(200).json({ 
      isValid: true, 
      message: "Approved student email." 
    });

  } catch(error) {
    //
  }
}

export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password: passwordRaw, name, dateOfBirth, phoneNumber } = req.body;

        // 1. Validate the .edu.ng domain in email
        if (!isValidEduEmail(email)) {
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
            { userId: user.id, email: user.email },
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

export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
    try{
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized."
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                university: true,
                isPhoneVerified: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({ user });
    } catch(error) {
        console.error("GetMe error:", error);
        return res.status(500).json({ message: "Internal server error during fetching user data." });
    }
}

export const refreshAccessToken = async (req: Request, res: Response): Promise<any> => {
  try {
    // The token from the client from cookies or body for a refresh
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            message: "No token provided. Refresh token is required."
        });
    }

    // Verify the current token
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string || "summayh_dev_secret_key_0627"
    ) as { userId: string, email: string };


    // Make sure user stil exists in database
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
    });

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized. User no longer exists."
        });
    }

    // Issue a brand new token
    const newToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string || "summayh_dev_secret_key_0627",
        { expiresIn: "7d" }
    )

    return res.status(200).json({
        message: " Token refreshed succesfully.",
        token: newToken
    })
  } catch(error) {
    return res.status(401).json({
        message: "Invalid or expired token. Please log in again."
    });
}
}

export const logoutUser = async (req: Request, res: response): Promise<any> => {
    try {
        // In a stateless JWT setup, logout is handled by the frontend deleting the token.
        // If you add cookies later, you would clear them here like:
        // res.clearCookie('token');

        res.status(200).json({
            message: "Logged out successfully. Please remove token from client storage (e.g., localStorage) to complete logout."
        })
    } catch(error) {
        console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error during logout." });
    }
}