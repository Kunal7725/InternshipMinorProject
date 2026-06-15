const mongoose = require("mongoose");
const crypto = require("crypto");

// Generates a unique admin code like ATG123, XKR891
const generateAdminCode = () => {
    const letters = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 3);
    const numbers = Math.floor(100 + Math.random() * 900); // always 3 digits
    return `${letters}${numbers}`;
};

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER",
        },
        // Unique invite code — only set for ADMIN accounts, null for regular users
        adminCode: {
            type: String,
            unique: true,
            sparse: true, // allows multiple null values (users won't have this)
            default: null,
        },
        // Links a USER to the ADMIN who created/invited them. null = top-level Admin account.
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
module.exports.generateAdminCode = generateAdminCode;