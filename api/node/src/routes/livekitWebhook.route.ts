import { Router } from "express";
import { WebhookReceiver } from "livekit-server-sdk";
import { CallService } from "../services/call.service";

const router = Router();
const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
)

router.post("/", async(req, res) => {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader) return res.status(401).send("Missing auth header");

        const event = await receiver.receive(req.body, authHeader); //raw buffer here no pre-parsed JSON

        console.error(`[LIVEKIT WEBHOOK] event=${event.event} room=${event.room?.name}`);

        switch(event.event) {
            case "participant_joined":
                await CallService.handleParticipantJoined(event);
                break;
            case "participant_left":
                await CallService.handleParticipantLeft(event);
                break;
            default:
                break;
        }

        return res.status(200).send("ok");
    } catch (error: any) {
        console.error("[LIVEKIT WEBHOOOK] verification/handling failed:", error);
        return res.status(400).send("Invalid webhook")
    }
})

export default router;