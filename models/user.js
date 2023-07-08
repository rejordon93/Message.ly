class User {
  constructor(username, first_name, last_name, phone, join_at, last_login_at) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
    this.join_at = join_at;
    this.last_login_at = last_login_at;
  }

  static async register({ username, password, first_name, last_name, phone }) {
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5, current_timestamp)
      RETURNING username, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]
    );

    const { username, first_name, last_name, phone } = result.rows[0];
    return new User(username, first_name, last_name, phone);
  }

  static async authenticate(username, password) {
    if (!username || !password) {
      return false;
    }
    return true;
  }

  static async updateLoginTimestamp(username) {
    await db.query(
      `UPDATE last_login SET last_login_at = NOW()
      WHERE username = $1`,
      [username]
    );
  }

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users`
    );

    return result.rows.map(
      (row) =>
        new User(
          row.username,
          row.first_name,
          row.last_name,
          row.phone,
          row.join_at,
          row.last_login_at
        )
    );
  }

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return null;
    }

    return new User(
      user.username,
      user.first_name,
      user.last_name,
      user.phone,
      user.join_at,
      user.last_login_at
    );
  }

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT messages.id, messages.to_user, messages.body, messages.sent_at, messages.read_at,
        users.username, users.first_name, users.last_name, users.phone
      FROM messages
      JOIN users ON messages.to_user = users.username
      WHERE messages.from_user = $1`,
      [username]
    );

    const messages = result.rows.map((row) => ({
      id: row.id,
      to_user: {
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
      },
      body: row.body,
      sent_at: row.sent_at,
      read_at: row.read_at,
    }));

    return messages;
  }

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT messages.id, messages.from_user, messages.body, messages.sent_at, messages.read_at,
        users.username, users.first_name, users.last_name, users.phone
      FROM messages
      JOIN users ON messages.from_user = users.username
      WHERE messages.to_user = $1`,
      [username]
    );

    const messages = result.rows.map((row) => ({
      id: row.id,
      from_user: {
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
      },
      body: row.body,
      sent_at: row.sent_at,
      read_at: row.read_at,
    }));

    return messages;
  }
}

module.exports = User;
