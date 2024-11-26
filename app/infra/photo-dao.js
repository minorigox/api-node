const photoConverter = row => ({
    id: row.photo_id,
    postDate: new Date(row.photo_post_date),
    url: row.photo_url,
    description: row.photo_description,
    allowComments: row.photo_allow_comments == 'true' ? true : false,
    likes: row.likes,
    comments: row.comments,
    userId: row.user_id,
});

const commentConverter = row => ({
    date: row.comment_date,
    text: row.comment_text,
    userName: row.user_name
});

const maxRows = 12;

class PhotoDao {

    constructor(db) {
        this._db = db;
    }

    listAllFromUser(userName, page) {
        const from = (page - 1) * maxRows;

        let limitQuery = '';
        if (page) limitQuery = `LIMIT ${from}, ${maxRows}`;

        try {
            const rows = this._db.prepare(`
                SELECT  p.*,
                        (SELECT COUNT(c.comment_id) 
                            FROM comment as c 
                            WHERE c.photo_id = p.photo_id
                         ) as comments, 

                        (SELECT COUNT(l.like_id) 
                            FROM like as l 
                            WHERE l.photo_id = p.photo_id
                        ) as likes 
                FROM photo AS p
                        JOIN user AS u ON p.user_id = u.user_id
                WHERE u.user_name = ?
                ORDER BY p.photo_post_date DESC
                ${limitQuery}
            `).all(userName);

            return rows.map(photoConverter);
        } catch (err) {
            console.log(err);
            throw new Error("Can't list photos");
        }
    }

    add(photo, user_id) {
        try {
            const stmt = this._db.prepare(`
                INSERT INTO photo (
                    photo_post_date,
                    photo_url,
                    photo_description,
                    photo_allow_comments,
                    user_id
                ) values (?,?,?,?,?)
            `);
            stmt.run(
                new Date(),
                photo.url,
                photo.description,
                photo.allowComments,
                user_id
            );
            return stmt.lastInsertRowid;  // return the last inserted ID
        } catch (err) {
            console.log(err);
            throw new Error("Can't add photo");
        }
    }

    findById(id) {
        try {
            const row = this._db.prepare(`
                SELECT  p.*, 
                        (SELECT COUNT(c.comment_id) 
                            FROM comment as c 
                            WHERE c.photo_id = p.photo_id
                        ) as comments, 
                        (SELECT COUNT(l.like_id) 
                            FROM like as l 
                            WHERE l.photo_id = p.photo_id
                        ) as likes 
                FROM photo AS p
                WHERE p.photo_id = ?
                ORDER BY p.photo_post_date DESC
            `).get(id);

            if (row) {
                return photoConverter(row);
            } else {
                return null;
            }
        } catch (err) {
            console.log(err);
            throw new Error("Can't find photo");
        }
    }

    remove(id) {
        try {
            const stmt = this._db.prepare(`DELETE FROM photo WHERE photo_id = ?`);
            stmt.run(id);
        } catch (err) {
            console.log(err);
            throw new Error("Can't remove photo");
        }
    }

    addComment(text, photoId, userId) {
        try {
            const stmt = this._db.prepare(`
                INSERT INTO comment (
                    comment_date, 
                    comment_text, 
                    photo_id,
                    user_id
                ) values (?,?,?, ?)
            `);
            stmt.run(new Date(), text, photoId, userId);
            return stmt.lastInsertRowid;  // return the last inserted ID
        } catch (err) {
            console.log(err);
            throw new Error("Can't add comment");
        }
    }

    getCommentsFromPhoto(photoId) {
        try {
            const rows = this._db.prepare(`
                SELECT 
                    c.comment_date, c.comment_text, u.user_name 
                FROM comment as c 
                    JOIN user as u ON u.user_id = c.user_id 
                WHERE c.photo_id = ? 
                ORDER BY c.comment_date DESC  
            `).all(photoId);

            return rows.map(commentConverter);
        } catch (err) {
            console.log(err);
            throw new Error("Can't load comments");
        }
    }

    findCommentById(commentId) {
        try {
            const row = this._db.prepare(`
                SELECT 
                    c.comment_date, c.comment_text, u.user_name 
                FROM comment as c 
                    JOIN user as u ON u.user_id = c.user_id 
                WHERE c.comment_id = ?
            `).get(commentId);

            if (row) {
                return commentConverter(row);
            } else {
                return null;
            }
        } catch (err) {
            console.log(err);
            throw new Error("Can't load comment");
        }
    }

    likeById(photoId, userId) {
        try {
            const stmt = this._db.prepare(`
                INSERT OR IGNORE INTO like 
                    (photo_id, user_id) 
                VALUES 
                    (?, ?)
            `);
            stmt.run(photoId, userId);
            return stmt.changes > 0;  // returns true if a row was affected
        } catch (err) {
            console.log(err);
            throw new Error("Can't like photo");
        }
    }
}

module.exports = PhotoDao;