"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const livekit_server_sdk_1 = require("livekit-server-sdk");
const call_service_1 = require("../services/call.service");
const router = (0, express_1.Router)();
const receiver = new livekit_server_sdk_1.WebhookReceiver(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
router.post("/", async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader)
            return res.status(401).send("Missing auth header");
        const event = await receiver.receive(req.body, authHeader); //raw buffer here no pre-parsed JSON
        console.error(`[LIVEKIT WEBHOOK] event=${event.event} room=${event.room?.name}`);
        switch (event.event) {
            case "participant_joined":
                await call_service_1.CallService.handleParticipantJoined(event);
                break;
            case "participant_left":
                await call_service_1.CallService.handleParticipantLeft(event);
                break;
            default:
                break;
        }
        return res.status(200).send("ok");
    }
    catch (error) {
        console.error("[LIVEKIT WEBHOOOK] verification/handling failed:", error);
        return res.status(400).send("Invalid webhook");
    }
});
exports.default = router;
