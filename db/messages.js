/**
 * Module handles database management
 *
 * The sample data is for a chat log with one table:
 * Messages: id + message text
 */


const dbWrapper = require("sqlite");
const faker = require("faker");
let db;

// Server script calls these methods to connect to the db
module.exports = {
  
  // Get the messages in the database
  getMessages: async () => {
    try {
      return await db.all("SELECT * from Messages");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  // Add new message
  addMessage: async message => {
    let success = false;
    try {
      success = await db.run("INSERT INTO Messages (message) VALUES (?)", [
        message
      ]);
    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  },

  // Update message text
  updateMessage: async (id, message) => {
    let success = false;
    try {
      success = await db.run(
        "Update Messages SET message = ? WHERE id = ?",
        message,
        id
      );
    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  },

  // Remove message
  deleteMessage: async id => {
    let success = false;
    try {
      success = await db.run("Delete from Messages WHERE id = ?", id);
    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  }
};

