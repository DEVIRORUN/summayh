"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailOtpEmail = EmailOtpEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
function EmailOtpEmail({ name, otp }) {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Body, { style: { fontFamily: "sans-serif" }, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { children: [(0, jsx_runtime_1.jsx)(components_1.Heading, { children: "Verify your email" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { children: ["Hi ", name, ", your SUMMAYH verification code is:"] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: "28px", fontWeight: "bold" } }), (0, jsx_runtime_1.jsx)(components_1.Text, { children: "This code expires in 10 minutes. If you didn't request this, you can ignore this email." })] }) })] }));
}
