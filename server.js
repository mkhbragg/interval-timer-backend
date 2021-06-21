/**
 * This is the main server script that provides the API endpoints
 *
 * Uses sqlite.js to connect to db
 */

const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false
});

fastify.register(require("fastify-formbody"));

const db = require("./sqlite.js");
const errorMessage =
  "Whoops! Error connecting to the database–please try again!";

// OnRoute hook to list endpoints
const routes = { endpoints: [] };
fastify.addHook("onRoute", routeOptions => {
  routes.endpoints.push(routeOptions.method + " " + routeOptions.path);
});

// Just send some info at the home route
fastify.get("/", (request, reply) => {
  const data = {
    title: "Minimal SQLite",
    intro: "This is a database-backed API with the following endpoints",
    routes: routes.endpoints
  };
  reply.status(200).send(data);
});

// Return the poll options from the database helper script - no auth
fastify.get("/options", async (request, reply) => {
  let data = {};
  data.options = await db.getOptions();
  console.log(data.options);
  if(!data.options) data.error = errorMessage;
  const status = data.error ? 400 : 200;
  reply.status(status).send(data);
});

// Add new option (auth)
fastify.post("/option", async (request, reply) => {
  let data = {};
  const auth = authorized(request.headers.admin_key);
  if(!auth || !request.body || !request.body.language) data.success = false;
  else if(auth) data.success = await db.addOption(request.body.language);
  const status = data.success ? 201 : auth ? 400 : 401;
  reply.status(status).send(data);
});

// Update count for an option (auth)
fastify.put("/option", async (request, reply) => { 
  let data = {};
  const auth = authorized(request.headers.admin_key);
  if(!auth || !request.body || !request.body.language || !request.body.picks) data.success = false;
  else data.success = await db.updateOption(request.body.language, request.body.picks); 
  const status = data.success ? 201 : auth ? 400 : 401;
  reply.status(status).send(data);
});

// Delete an option (auth)
fastify.delete("/option", async (request, reply) => {
  let data = {};
  const auth = authorized(request.headers.admin_key);
  if(!auth || !request.body || !request.body.language) data.success = false;
  else data.success = await db.deleteOption(request.body.language);
  const status = data.success ? 201 : auth ? 400 : 401;
  reply.status(status).send(data);
});

// Helper function to authenticate the user key
const authorized = key => {
  if (
    !key ||
    key < 1 ||
    !process.env.ADMIN_KEY ||
    key !== process.env.ADMIN_KEY
  )
    return false;
  else return true;
};

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
