import { createServer } from "http";
import staticHandler from "serve-handler";
import ws, { WebSocketServer } from "ws";

const port = 8080;

/**
 * We first create an HTTP server and forward every request to a special handler
 * which will take care to serve all the static files from the public directory.
 * This is needed to access the client-side resources of our application (for example, HTML, JavaScript, and CSS files).
 */
const httpServer = createServer((req, res) => {
  return staticHandler(req, res, { public: "public" });
});

/**
 * We then create a new instance of the WebSocket server,
 * and we attach it to our existing HTTP server.
 */
const webSocketServer = new WebSocketServer({ server: httpServer });

/**
 * Next, we start listening for incoming WebSocket client connections
 * by attaching an event listener for the connection event.
 */
webSocketServer.on("connection", (client) => {
  console.log("Client connected !");

  /**
   * Each time a new client connects to our server, we start listening for incoming messages.
   * When a new message arrives, we broadcast it to all the connected clients.
   */
  client.on("message", (msg) => {
    console.log(`Message:${msg}`);
    broadcast(msg);
  });
});

/**
 * the broadcast() function is a simple iteration over all the known clients,
 * where the send() function is invoked on each connected client.
 * This is the magic of Node.js! Of course, the server that
 * we just implemented is very minimal and basic, but as we will see, it does its job.
 */
function broadcast(msg: any) {
  for (const client of webSocketServer.clients) {
    if (client.readyState === ws.OPEN) {
      client.send(msg);
    }
  }
}

httpServer.listen(port, () => {
  console.log(`server listening on ${port}`);
});
