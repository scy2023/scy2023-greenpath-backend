import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pkg from "pg";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users (email, password_hash) VALUES ($1,$2)", [email, hash]);
  res.send("User registered");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const valid = await bcrypt.compare(password, user.rows[0].password_hash);
  const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
  res.json({ token });
});
import pkg2 from "google-auth-library";
const { OAuth2Client } = pkg2;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name } = ticket.getPayload();
    let user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1,$2)",
        [email, "google-auth"]
      );
      user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    }
    const jwtToken = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
    res.json({ token: jwtToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;