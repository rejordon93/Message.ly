// GET / - get list of users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.all();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

// GET /:username - get detail of user
router.get("/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.get(username);

    if (!user) {
      throw new Error("User not found");
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

// GET /:username/to - get messages to user
router.get("/:username/to", async (req, res, next) => {
  try {
    const username = req.params.username;
    const messages = await User.messagesTo(username);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

// GET /:username/from - get messages from user
router.get("/:username/from", async (req, res, next) => {
  try {
    const username = req.params.username;
    const messages = await User.messagesFrom(username);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});
