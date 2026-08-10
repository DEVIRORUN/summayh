"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const invoice_service_1 = require("../services/invoice.service");
class InvoiceController {
    static async create(req, res) {
        try {
            const userId = req.userId;
            const { clientName, decsription, amount } = req.body;
            const amountNum = Number(amount);
            if (!clientName || !decsription || !amountNum || amountNum <= 0) {
                return res
                    .status(400)
                    .json({ message: "clientName, description, amount are requred!!!" });
            }
            const result = await invoice_service_1.InvoiceService.createInvoice(userId, clientName, decsription, amount);
            return res.status(201).json(result);
        }
        catch (error) {
            console.error(new Date(), "-> [Invoice Create Error]: ", error);
            return res.status(500).json({ message: error.message });
        }
    }
    static async getById(req, res) {
        try {
            const { invoiceId } = req.params;
            const invoice = await invoice_service_1.InvoiceService.getInvoiceById(invoiceId);
            return res.status(200).json({ data: invoice });
        }
        catch (error) {
            console.error(new Date(), "-> [invoice Fetch Error]:", error.message);
            return res.status(404).json({ message: error.message });
        }
    }
    static async pay(req, res) {
        try {
            const { invoiceId } = req.params;
            const { email, name } = req.body;
            if (!email || !name) {
                return res
                    .status(400)
                    .json({ message: "email and name are required." });
            }
            const result = await invoice_service_1.InvoiceService.initializeInvoicePayment(invoiceId, email, name);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error(new Date(), "-> [Invoice Pay Error]:", error.message);
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.InvoiceController = InvoiceController;
