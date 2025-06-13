// src/routes/auth.routes.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import sampleUsers from '../sampleUsers.js';
import auth from '../middlewares/auth.js';

const router = Router();

/* 🔧 Helper: Extract JSON safely from raw body */
function safeParseBody(req) {
  const sources = [req.body, req.rawBody, req.event && req.event.body];
  for (const src of sources) {
    if (!src) continue;
    if (typeof src === 'object' && !Buffer.isBuffer(src)) return src;
    try {
      return JSON.parse(src.toString());
    } catch (e) {
      // ignore and try next source
    }
  }
  console.warn('[Body] Unable to parse body');
  return {};
}

/* 🚀 Register */
router.post('/register', async (req, res) => {
  try {
    const body = safeParseBody(req);
    const { name, email, password, guests } = body;

    if (!name || !email || !password || guests === undefined) {
      console.warn('[Register] Missing fields', { name, email, password, guests });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (process.env.CONNECTION_STRING) {
      const exists = await User.exists({ email });
      if (exists) {
        console.warn('[Register] Email in use:', email);
        return res.status(400).json({ message: 'Email already in use' });
      }

      const user = await User.create({ name, email, password, guests });
      const token = signToken({ id: user._id, name: user.name, guests: user.guests });

      console.log('[Register] MongoDB user created:', user._id);
      return res.json({ token, user: { id: user._id, name: user.name, guests: user.guests } });
    }

    if (sampleUsers.find(u => u.email === email)) {
      console.warn('[Register] Sample email in use:', email);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = { id: nanoid(), name, email, password: hash, guests };
    sampleUsers.push(user);
    const token = signToken({ id: user.id, name: user.name, guests });

    console.log('[Register] Sample user added:', user.id);
    return res.json({ token, user: { id: user.id, name: user.name, guests } });

  } catch (err) {
    console.error('[Register] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/* 🔐 Login */
router.post('/login', async (req, res) => {
  try {
    const body = safeParseBody(req);
    const { email, password } = body;

    if (!email || !password) {
      console.warn('[Login] Missing credentials');
      return res.status(400).json({ message: 'Missing credentials' });
    }

    let user;
    if (process.env.CONNECTION_STRING) {
      user = await User.findOne({ email });
    } else {
      user = sampleUsers.find(u => u.email === email);
    }

    if (!user) {
      console.warn('[Login] No user:', email);
      return res.status(400).json({ message: 'Bad credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[Login] Password mismatch:', email);
      return res.status(400).json({ message: 'Bad credentials' });
    }

    const id = user._id || user.id;
    const token = signToken({ id, name: user.name, guests: user.guests });

    console.log('[Login] Success:', id);
    return res.json({ token, user: { id, name: user.name, guests: user.guests } });

  } catch (err) {
    console.error('[Login] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/* 🔑 Update password */
router.patch('/password', auth, async (req, res) => {
  try {
    const body = safeParseBody(req);
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findById(req.user._id);
    if (!user) return res.sendStatus(401);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('[Password] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/* 📝 Update profile (name) */
router.patch('/profile', auth, async (req, res) => {
  try {
    const body = safeParseBody(req);
    const { name } = body;
    if (!name) return res.status(400).json({ message: 'Missing name' });

    const user = await User.findById(req.user._id);
    if (!user) return res.sendStatus(401);

    user.name = name;
    await user.save();

    const token = signToken({ id: user._id, name: user.name });
    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (err) {
    console.error('[Profile] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
