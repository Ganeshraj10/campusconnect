const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Name, email, and password are required."
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Password must be at least 6 characters."
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Please provide a valid email address."
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Email and password are required."
    });
  }
  next();
};

const validateEventCreation = (req, res, next) => {
  const { name, category, date, venue, capacity } = req.body;
  if (!name || !category || !date || !venue || capacity === undefined) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Name, category, date, venue, and capacity are required."
    });
  }

  if (Number(capacity) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Capacity must be a positive integer."
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateEventCreation
};
