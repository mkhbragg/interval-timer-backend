/**
 * This is the main server script that provides the API endpoints
 * The script uses the database helper script
 * The endpoints retrieve, update, and return data
 */

// Utilities we need
const fs = require("fs");
const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// Get the database module
const db = require("./sqlite.js");
const errorMessage = "Whoops! Error connecting to the database–please try again!";

/**
 * We just send some info at the home route
 */
fastify.get("/", (request, reply) => {
  let data = {
    title: 'MVP SQLite',
    intro: 'This is a database-backed API with the following endpoints',
    endpoints: [
      'GET /options',
      'POST /options',
      'GET /logs',
      'POST /reset'
    ],
    info: 'Check out the README and server.js code'
  }
  reply.status(200).send(data);
});

/**
 * Return the poll options from the database helper script
 *
 * Auth not required
 */
fastify.get("/options", async (request, reply) => {
  let data = {};
  // Get the available choices from the database
  data.options = await db.getOptions();
  data.error = data.options ? null : errorMessage;
  console.log(data);
  reply.status(200).send(data);
});

/**
* auth
*/
fastify.post("/option", async (request, reply) => {
  
});

/**
* auth
*/
fastify.put("/option", async (request, reply) => {
  
});

/**
* auth
*/
fastify.delete("/option", async (request, reply) => {
  
});

/**
 * Post route to process vote
 *
 * Retrieve vote from body data
 * Send vote to database helper
 * Return updated list of votes
 */
fastify.post("/vote", async (request, reply) => {
  let data = {};
  let err = null;
  if (request.body.language)
    data.options = await db.processVote(request.body.language);
  else err = "No vote received in body!";
  data.error = data.options ? err : errorMessage;
  let status = data.error ? 400 : 201;
  reply.status(status).send(data);
});

/**
 * Admin endpoint returns log of votes
 */
fastify.get("/logs", async (request, reply) => {
  let data = {};
  data.optionHistory = await db.getLogs();
  data.error = data.optionHistory ? null : errorMessage;
  let status = data.error ? 400 : 201;
  reply.status(status).send(data);
});

/**
 * Admin endpoint to empty all logs
 *
 * Requires authorization (see setup instructions in README)
 * If auth fails, return a 401 and the log list
 * If auth is successful, empty the history
 */
fastify.post("/reset", async (request, reply) => {
  let data = {}; 
  if (
    !request.headers.admin_key ||
    request.headers.admin_key.length < 1 ||
    !process.env.ADMIN_KEY ||
    request.headers.admin_key !== process.env.ADMIN_KEY
  ) {
    console.error("Auth fail");
    data.failed = "You entered invalid credentials!";
    data.optionHistory = await db.getLogs();
  } else {
    data.optionHistory = await db.clearHistory();
    data.error = data.optionHistory ? null : errorMessage;
  }
  const status = data.failed ? 401 : 200;
  reply.status(status).send(data);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
