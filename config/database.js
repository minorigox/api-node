const Database = require("better-sqlite3");
const db = new Database("data.db");

const USER_SCHEMA = `
CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_name VARCHAR(30) NOT NULL UNIQUE, 
    user_email VARCHAR(255) NOT NULL, 
    user_password VARCHAR(255) NOT NULL,
    user_full_name VARCHAR(40) NOT NULL, 
    user_join_date TIMESTAMP DEFAULT current_timestamp
);
`;

const INSERT_DEFAULT_USER_1 = `
INSERT INTO user (
    user_name, 
    user_email,
    user_password,
    user_full_name
) SELECT 'flavio', 'flavio@alurapic.com.br', '123', 'Flávio' WHERE NOT EXISTS (SELECT * FROM user WHERE user_name = 'flavio');
`;

const INSERT_DEFAULT_USER_2 = `
INSERT INTO user (
    user_name, 
    user_email,
    user_password,
    user_full_name
) SELECT 'almeida', 'almeida@alurapic.com.br', '123', 'Almeida' WHERE NOT EXISTS (SELECT * FROM user WHERE user_name = 'almeida');
`;

const PHOTO_SCHEMA = `
CREATE TABLE IF NOT EXISTS photo (
    photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_post_date TIMESTAMP NOT NULL, 
    photo_url TEXT NOT NULL, 
    photo_description TEXT DEFAULT ('') NOT NULL, 
    photo_allow_comments INTEGER NOT NULL DEFAULT (1), 
    photo_likes BIGINT NOT NULL DEFAULT (0),
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE 
);
`;

const COMMENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS comment (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_date TIMESTAMP NOT NULL,
    comment_text TEXT DEFAULT (''), 
    photo_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (photo_id) REFERENCES photo (photo_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE 
);
`;

const LIKE_SCHEMA = `
CREATE TABLE IF NOT EXISTS like (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    photo_id INTEGER,
    user_id INTEGER,
    like_date TIMESTAMP DEFAULT current_timestamp, 
    UNIQUE(user_id, photo_id),
    FOREIGN KEY (photo_id) REFERENCES photo (photo_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE
);
`;

db.exec(`
    PRAGMA foreign_keys=ON;

    ${USER_SCHEMA}
    ${INSERT_DEFAULT_USER_1}
    ${INSERT_DEFAULT_USER_2}
    ${PHOTO_SCHEMA}
    ${COMMENT_SCHEMA}
    ${LIKE_SCHEMA}
`);

const users = db.prepare("SELECT * FROM user").all();
console.log("Users:", users);

process.on("SIGINT", () => {
    db.close(() => {
        console.log("Database closed");
        process.exit(0);
    });
});

module.exports = db;