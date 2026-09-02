const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { generateToken } = require("../utils/jwt");
const logger = require("../utils/logger");

const register = async (userData) => {
  const { name, email, password, role, registerNumber, department, year, phone } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    logger.warn(`Registration rejected: User with email "${email}" already exists.`);
    const error = new Error("A user with this email address already exists.");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Validate role enum
  const validRole = ["STUDENT", "ORGANIZER", "ADMIN"].includes(role?.toUpperCase())
    ? role.toUpperCase()
    : "STUDENT";

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: validRole,
      registerNumber: registerNumber || null,
      department: department || null,
      year: year || null,
      phone: phone || null
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      registerNumber: true,
      department: true,
      year: true,
      phone: true,
      createdAt: true
    }
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  logger.info(`User registered successfully: ${user.email} (Role: ${user.role}, ID: ${user.id})`);
  return { user, token };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    logger.warn(`Login failed: Account not found for email "${email}".`);
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn(`Login failed: Incorrect password for email "${email}".`);
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    registerNumber: user.registerNumber,
    department: user.department,
    year: user.year,
    phone: user.phone,
    createdAt: user.createdAt
  };

  logger.info(`User login successful: ${user.email} (Role: ${user.role}, ID: ${user.id})`);
  return { user: safeUser, token };
};



const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      registerNumber: true,
      department: true,
      year: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          registrations: true,
          events: true
        }
      }
    }
  });

  if (!user) {
    const error = new Error("User profile not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  register,
  login,
  getProfile
};
