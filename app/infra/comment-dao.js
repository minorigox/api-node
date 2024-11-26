const commentConverter = row => ({
    date: row.comment_date,
    text: row.comment_text,
    userName: row.user_name
});

class CommentDao {

    constructor(db) {
        this._db = db;
    }

    add(text, photoId, userId) {
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
            return stmt.lastInsertRowid;  // retorna o ID do último comentário inserido
        } catch (err) {
            console.log(err);
            throw new Error("Can't add comment");
        }
    }

    listAllFromPhoto(photoId) {
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

    findById(commentId) {
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
}

module.exports = CommentDao;