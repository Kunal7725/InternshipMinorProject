const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename:    (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /pdf|doc|docx|txt|zip|png|jpg|jpeg|gif|mp4|xlsx|pptx/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    allowed.test(ext) ? cb(null, true) : cb(new Error("File type not allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

module.exports = upload;
