const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const GUEST_LIMIT = 5;

// In-memory store: IP → usage count
// Resets on server restart; swap for Redis/DB for persistence
const guestUsage = new Map();

/**
 * Middleware that limits unauthenticated (guest) users to GUEST_LIMIT
 * humanize calls. Authenticated users pass through freely.
 */
const guestLimitMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // ── Authenticated user? Let them through ──
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;          // attach user info for downstream use
            return next();               // no limit for logged-in users
        } catch {
            // Token invalid/expired — treat as guest
        }
    }

    // ── Guest flow ──
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const currentCount = guestUsage.get(ip) || 0;

    if (currentCount >= GUEST_LIMIT) {
        return res.status(403).json({
            error: "Guest limit reached",
            requiresAuth: true,
            message:
                "You\u2019ve used all 5 free humanizations. Sign up or log in to continue.",
        });
    }

    // Increment and attach remaining count
    const newCount = currentCount + 1;
    guestUsage.set(ip, newCount);
    res.setHeader("X-Guest-Uses-Remaining", GUEST_LIMIT - newCount);

    next();
};

module.exports = guestLimitMiddleware;
