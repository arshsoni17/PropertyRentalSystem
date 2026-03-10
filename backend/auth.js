import 'dotenv/config'; //must be first
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import connection from './dbconnect.js';
import isAuthenticated from './middleware.js';

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

const router = express.Router();


const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
});

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: " all enteries are required" });
        }
        const [existing] = await connection.execute(
            "SELECT * FROM USERS WHERE email = ?",
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: "Emial already exists" })
        }
        //generate a 6-digit verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        //store tem user data with verfication code expire in 2 min
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await connection.execute(
            `INSERT INTO pending_users (name, email, password, verification_code, expires_at) 
                VALUES (?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                name = VALUES(name), 
                password = VALUES(password), 
                verification_code = VALUES(verification_code), 
                expires_at = VALUES(expires_at)`,
            [name, email, hashedPassword, verificationCode, expiresAt]
        );
        const mailOptions = {
            from: 'arshdeepdurali2005@gmail.com',
            to: email,
            subject: 'Email Verification Code',
            html: `
                    <h2>Welcome to Property Rental!</h2>
                    <p>Hello ${name},</p>
                    <p>Your verification code is: <strong>${verificationCode}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "verfication code send to your email", email: email });
    }
    catch (error) {
        res.send(401).json({ message: "can't send verification code" })
    }

});
//verify code and complete registration
router.post("/verify-email", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required" });
    }
    const [pending] = await connection.execute(
        "SELECT * FROM pending_users WHERE email = ? AND verification_code = ?",
        [email, code]
    );
    if (pending.length === 0) {
        return res.status(400).json({ error: "Invalid verification code" });
    }
    const pendingUser = pending[0];
    if (new Date() > new Date(pendingUser.expires_at)) {
        return res.status(400).json({ error: "Verification code expired" });
    }
    const [result] = await connection.execute(
        "INSERT INTO users (name, email, password, is_verified) VALUES (?, ?, ?, ?)",
        [pendingUser.name, pendingUser.email, pendingUser.password, true]
    );
    await connection.execute(
        "DELETE FROM pending_users WHERE email = ?",
        [email]
    );

    res.status(201).json({
        message: "Registration successful",
        user: {
            id: result.insertId,
            name: pendingUser.name,
            email: email
        }
    });
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await connection.execute(
        'SELECT * FROM users WHERE EMAIL = ?', [email]
    )
    if (rows.length === 0) {
        return res.status(400).json({message:`Invalid User, register first`});
    }
    const user = rows[0];
    //now we have to check that if user is no more valid, in block, so no login and delete that entry from the db

    const isMatch = await bcrypt.compare(password, user.password);

    if (user.is_blocked === 1) {
        return res.status(401).json({ message: "User is blocked" });
    }
    if (!isMatch) {
        return res.status(400).json({ message: "wrong password" });
    }
    const token = jwt.sign({ userId: user.id, userName: user.name, userRole: user.role }, JWT_SECRET)
    res.json({
        message: "Login Success",
        token: token,
        userId: user.id,
        userName: user.name
    });
});
router.post("/resend-code", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) { return res.status(401).json({ message: "email absent" }) };
        const [existing] = await connection.execute(
            "SELECT * FROM pending_users WHERE EMAIL = ?",
            [email]
        );
        if (existing.length === 0) {
            return res.status(401).json({ message: "No pending requests" })
        }
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await connection.execute(
            "UPDATE pending_users SET verification_code = ?, expires_at = ? WHERE email = ?",
            [verificationCode, expiresAt, email]
        );

        const mailOptions = {
            from: 'arshdeepdurali2005@gmail.com',
            to: email,
            subject: 'Email Verification Code',
            html: `
                <h2>Welcome to Property Rental!</h2>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: "Code resend successfull" });
    }
    catch (error) {
        res.status(401).json({ message: "Can't resend code" });
    }
});
router.get("/logout", (req, res) => {
    res.json({ message: "logout success" })
});




// to tackle the correction /////////////////////////////////
router.get('/check', async (req, res) => {
  try {
    const headerToken = req.headers.token;

    if (!headerToken) {
      return res.json({ authenticated: false });
    }

    const decoded = jwt.verify(headerToken, JWT_SECRET);

    const [rows] = await connection.execute(
      'SELECT is_blocked FROM users WHERE id = ?', [decoded.userId]
    );

    if (rows.length === 0) return res.json({ authenticated: false });

    if (rows[0].is_blocked) {
      return res.json({ authenticated: false, is_blocked: true });
    }

    res.json({
      authenticated: true,
      is_blocked: false,
      userId: decoded.userId,
      userName: decoded.userName,
    });
  } catch (err) {
    res.json({ authenticated: false });
  }
});
router.get('/check/admin', async (req, res) => {
  try {
    const headerToken = req.headers.token;

    if (!headerToken) {
      return res.json({ authenticated: false });
    }

    const decoded = jwt.verify(headerToken, JWT_SECRET);

    const [rows] = await connection.execute(
      'SELECT is_blocked, role FROM users WHERE id = ?', [decoded.userId]  // ← fix: select is_blocked and role
    );

    if (rows.length === 0) return res.json({ authenticated: false });

    if (rows[0].is_blocked) {
      return res.json({ authenticated: false, is_blocked: true });
    }

    if (rows[0].role !== 'ADMIN') {
      return res.json({ authenticated: false, is_admin: false });  // ← not an admin
    }

    res.json({
      authenticated: true,
      is_blocked: false,
      userId: decoded.userId,
      userName: decoded.userName,
    });
  } catch (err) {
    res.json({ authenticated: false });
  }
});
////////////////////////////////////////////////////////////



////for reset user should be verified therfore use token 
// router.use( isAuthenticated);
router.post("/reset-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) { return res.status(99).json({ message: "empty field" }) }
        const [existing] = await connection.execute("SELECT * FROM users WHERE EMAIL = ?", [email]);

        const user = existing[0];
        
        if (existing.length === 0) { return res.status(99).json({ message: "invalid email" }) }
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        // console.log(user);// working till here 
        await connection.execute(
            "INSERT INTO password_resets (user_id, token_hash,expires_at) VALUES (?,?,?)", [user.id, verificationCode, expiresAt]
        );
        console.log( user);
        const mailOptions = {
            from: 'arshdeepdurali2005@gmail.com',
            to: email,
            subject: 'Email Verification Code',
            html: `
                <h2>Welcome to Property Rental!</h2>
                <p>Your verification code for passChange is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: "Code for password reset successfull" });
    }
    catch (error) {
        console.log( error)
        res.status(401).json({ message: "Can't reset Password" })
    }
});
router.post("/reset-verify", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: "Missing fields" });
        }
        const [users] = await connection.execute(
            "SELECT id FROM users WHERE email=?",
            [email]
        );
        if (!users.length) {
            return res.status(400).json({ message: "Invalid email" });
        }
        const userId = users[0].id;
        const [rows] = await connection.execute(
            `SELECT * FROM password_resets
        WHERE user_id=? AND token_hash=?`,
            [userId, code]
        );
        const pendingReset = rows[0];
        if (new Date() > new Date(pendingReset.expires_at)) {
            return res.status(400).json({ error: "Verification code expired" });
        }
        const hashed = await bcrypt.hash(newPassword, saltRounds);
        await connection.execute(
            "UPDATE users SET password=? WHERE id=?",
            [hashed, userId]
        );
        await connection.execute(
            "DELETE FROM password_resets WHERE user_id=?",
            [userId]
        );
        res.json({ message: "Password reset successful" });
    }
    catch (error) {
        res.status(401).json({ message: "Can't verify resetpass code" })
    }
});

export default router;