const ActivityLog = require("../models/ActivityLog");

/**
 * auditLog(action, entity)
 * Returns an Express middleware that logs the action after the response is sent.
 * Usage: router.post("/", protect, adminOnly, auditLog("created_project", "Project"), createProject)
 */
const auditLog = (action, entity) => (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
        // Fire-and-forget — non-blocking
        if (req.user && body?.success) {
            const entityId = body?.data?._id || req.params?.id || null;
            ActivityLog.create({
                actor:    req.user._id,
                action,
                entity,
                entityId,
                meta:     { method: req.method, path: req.originalUrl },
                ip:       req.ip || "",
            }).catch(() => {}); // swallow errors — audit is non-critical
        }
        return originalJson(body);
    };

    next();
};

module.exports = auditLog;
