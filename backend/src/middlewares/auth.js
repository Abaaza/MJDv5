//src/middleware/auth

import jwt   from 'jsonwebtoken';
import User  from '../models/User.js';


export default async function auth(req, res, next) {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // always fetch fresh user to reflect latest 'authorized' status
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.sendStatus(401);

    req.user = user;
    next();
  } catch {
    return res.sendStatus(401);
  }
}
