import mongoose from "mongoose";

// Utility to check database health
export const checkDatabaseHealth = async () => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return {
        status: "disconnected",
        readyState: mongoose.connection.readyState,
        message: "Database not connected",
      };
    }

    // Test with a simple ping
    await mongoose.connection.db.admin().ping();

    return {
      status: "connected",
      readyState: mongoose.connection.readyState,
      message: "Database is healthy",
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  } catch (error) {
    return {
      status: "error",
      readyState: mongoose.connection.readyState,
      message: error.message,
      error: error.name,
    };
  }
};

// Utility to get connection info
export const getConnectionInfo = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    readyState: mongoose.connection.readyState,
    readyStateText: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections),
  };
};
