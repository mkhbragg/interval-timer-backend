/**
 * Module handles database management
 *
 * The sample data is for a coding language poll with one table:
 * Choices: language names + count of votes cast for each
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

      } else {
        console.log(await db.all("SELECT * from Choices"));

      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Server script calls these methods to connect to the db
module.exports = {
  
  // Get the options in the database
  getOptions: async () => {
    try {
      return await db.all("SELECT * from Choices");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  // Add new option initially set to zero
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
  }
};
