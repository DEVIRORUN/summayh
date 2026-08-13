"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderPlacedEmail = OrderPlacedEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
function OrderPlacedEmail({ sellerName, gigTitle }) {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Body, { style: { fontFamily: "sans-serif" }, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { children: [(0, jsx_runtime_1.jsx)(components_1.Heading, { children: "New order received" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { children: ["Hi ", sellerName, ", you just got an order for \"", gigTitle, "\"."] }), (0, jsx_runtime_1.jsx)(components_1.Text, { children: "Log in to SUMMAYH to view the details and get started." })] }) })] }));
}
