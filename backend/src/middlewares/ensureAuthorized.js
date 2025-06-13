// src/middlewares/ensureAuthorized.js
export default function ensureAuthorized(req, res, next) {
  if (!req.user.authorized)                      // flag set in JWT
    return res.status(403).json({ message: 'Account awaiting approval' });
  next();
}
