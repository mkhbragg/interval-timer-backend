/**
 * Module handles database management
 *
 * The sample data is for a chat log with one table:
 * Messages: id + message text
 */

const fs = require("fs");
const dbFile = "./.data/chat.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
const faker = require("faker");
const messages = require("./messages");
let db;

//SQLite wrapper for async / await connections https://www.npmjs.com/package/sqlite
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    try {
      if (!exists) {
        await db.run(
          "CREATE TABLE Messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT)"
        );
        for (let r = 0; r < 5; r++)
          await db.run(
            "INSERT INTO Messages (message) VALUES (?)",
            faker.hacker.phrase()
          );
      }
      console.log(await db.all("SELECT * from Messages"));
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Server script calls these methods to connect to the db
module.exports = {...messages};

