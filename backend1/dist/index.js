"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ws in node.js
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on("connection", (ws) => {
    ws.on("error", console.error);
    ws.on("message", (data) => {
        console.log("received:", data.toString());
    });
    ws.send("something");
});
