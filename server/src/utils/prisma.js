const { PrismaClient } = require("@prisma/client");

let prismaInstance = null;

/**
 * Returns the PrismaClient instance, configuring it with the current DATABASE_URL
 */
const getPrismaClient = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient(
      process.env.DATABASE_URL
        ? {
            datasources: {
              db: {
                url: process.env.DATABASE_URL
              }
            }
          }
        : undefined
    );
  }
  return prismaInstance;
};

// Proxy allows lazy instantiation so Prisma connects with secrets loaded dynamically
const prisma = new Proxy(
  {},
  {
    get(target, prop) {
      const client = getPrismaClient();
      const value = client[prop];
      if (typeof value === "function") {
        return value.bind(client);
      }
      return value;
    }
  }
);

module.exports = prisma;
