/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await db.query(
      "SELECT password FROM users WHERE username = $1",
      [username]
    );
    let user = result.rows[0];
    if (user) {
      if ((await bcrypt.compare(password, user.password)) === true) {
        let token = jwt.sign({ username }, tokenFromBody);
        return res.json({ token });
      }
    }
    throw new ExpressError("Invalid user/password", 400);
  } catch (err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone } = req.body;

    // Perform any necessary input validation or checks

    // Check if the username is already taken
    const existingUser = await User.get(username);
    if (existingUser) {
      throw new Error("Username is already taken");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the user
    const registeredUser = await User.register({
      username,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
    });

    // Generate a JWT token for the registered user
    const token = jwt.sign({ username }, tokenSecret); // Provide the appropriate token secret

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});
