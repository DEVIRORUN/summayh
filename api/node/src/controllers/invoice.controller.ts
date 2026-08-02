import { Response, Request } from "express";
import { InvoiceService } from "../services/invoice.service";

export class InvoiceController {
  static async create(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).userId;
      const { clientName, decsription, amount } = req.body;

      const amountNum = Number(amount);
      if (!clientName || !decsription || !amountNum || amountNum <= 0) {
        return res
          .status(400)
          .json({ message: "clientName, description, amount are requred!!!" });
      }

      const result = await InvoiceService.createInvoice(
        userId,
        clientName,
        decsription,
        amount,
      );
      return res.status(201).json(result);
    } catch (error: any) {
      console.error(new Date(), "-> [Invoice Create Error]: ", error);
      return res.status(500).json({ message: error.message });
    }
  }
  static async getById(req: Request, res: Response): Promise<any> {
    try {
      const { invoiceId } = req.params;
      const invoice = await InvoiceService.getInvoiceById(invoiceId as string);
      return res.status(200).json({ data: invoice });
    } catch (error: any) {
      console.error(new Date(), "-> [invoice Fetch Error]:", error.message);
      return res.status(404).json({ message: error.message });
    }
  }
  static async pay(req: Request, res: Response): Promise<any> {
    try {
      const { invoiceId } = req.params;
      const { email, name } = req.body;

      if (!email || !name) {
        return res
          .status(400)
          .json({ message: "email and name are required." });
      }

      const result = await InvoiceService.initializeInvoicePayment(
        invoiceId as string,
        email,
        name,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      console.error(new Date(), "-> [Invoice Pay Error]:", error.message);
      return res.status(400).json({ message: error.message });
    }
  }
}
