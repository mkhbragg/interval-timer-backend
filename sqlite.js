/**
 * Module handles database management
 *
 * The sample data is for a coding language poll with two tables:
 * Choices: language names + count of votes cast
 * Log: vote history
 */

const fs = require("fs");
const dbFile = "./.data/choices.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
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
          "CREATE TABLE Choices (id INTEGER PRIMARY KEY AUTOINCREMENT, language TEXT, picks INTEGER)"
        );

        await db.run(
          "INSERT INTO Choices (language, picks) VALUES ('HTML', 0), ('JavaScript', 0), ('CSS', 0)"
        );

        await db.run(
          "CREATE TABLE Log (id INTEGER PRIMARY KEY AUTOINCREMENT, choice TEXT, time STRING)"
        );
      } else {
        console.log(await db.all("SELECT * from Choices"));

        //If you need to remove a table
        //db.run("DROP TABLE Logs");
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Our server script will call these methods to connect to the db
module.exports = {
  // Get the options in the database
  getOptions: async () => {
    try {
      return await db.all("SELECT * from Choices");
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  // Add new option
  addOption: async language => {
    let success = false;
    try {
      success = await db.run(
        "INSERT INTO Choices (language, picks) VALUES (?, ?)",
        [language, 0]
      );
    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  },

  // Update picks for a language
  updateOption: async (language, picks) => {
    let success = false;
    try {
      success = await db.run(
        "Update Choices SET picks = ? WHERE language = ?",
        picks,
        language
      );
    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  },

  // Remove option
  deleteOption: async language => {
    let success = false;
    try {
      success = await db.run(
        "Delete from Choices WHERE language = ?",
        language
      );
    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  },

  // Process a user vote
  processVote: async language => {
    try {
      await db.run("INSERT INTO Log (choice, time) VALUES (?, ?)", [
        language,
        new Date().toISOString()
      ]);

      await db.run(
        "UPDATE Choices SET picks = picks + 1 WHERE language = ?",
        language
      );

      return await db.all("SELECT * from Choices");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  // Get logs
  getLogs: async () => {
    try {
      return await db.all("SELECT * from Log ORDER BY time DESC LIMIT 20");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  // Clear logs and reset votes
  clearHistory: async () => {
    try {
      await db.run("DELETE from Log");
      await db.run("UPDATE Choices SET picks = 0");

      return [];
    } catch (dbError) {
      console.error(dbError);
    }
  }
};
