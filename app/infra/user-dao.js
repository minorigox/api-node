const userConverter = row => ({
    id: row.user_id,
    name: row.user_name,
    email: row.user_email
});

class UserDao {
    constructor(db) {
        this._db = db;
    }

    findByNameAndPassword(userName, password) {
        try {
            const row = this._db.prepare(
                `SELECT * FROM user WHERE user_name = ? AND user_password = ?`
            ).get(userName, password);

            if (row) {
                return userConverter(row);
            }
            return null;
        } catch (err) {
            console.log(err);
            throw new Error("Can't find user");
        }
    }

    findByName(userName) {
        try {
            const row = this._db.prepare(`SELECT * FROM user WHERE user_name = ?`).get(userName);
            if (row) {
                return userConverter(row);
            }
            return null;
        } catch (err) {
            console.log(err);
            throw new Error("Can't find user");
        }
    }

    add(user) {
        try {
            const stmt = this._db.prepare(`
                INSERT INTO user (
                    user_name,
                    user_full_name,
                    user_email, 
                    user_password, 
                    user_join_date
                ) values (?,?,?,?,?)
            `);
            stmt.run(
                user.userName,
                user.fullName,
                user.email,
                user.password,
                new Date()
            );
            console.log(`User ${user.userName} registered!`);
        } catch (err) {
            console.log(err);
            throw new Error("Can't register new user");
        }
    }
}

module.exports = UserDao;