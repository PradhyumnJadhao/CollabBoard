// No database initialization needed for in-memory storage
export async function initializeDatabase() {
  console.log("Using in-memory storage, no database initialization needed");
  // The default session is created in the MemStorage constructor
}