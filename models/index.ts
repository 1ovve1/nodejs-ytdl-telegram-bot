import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../sequelize';  // Import the configured Sequelize instance
import User from './users';
import Video from "./videos";

// Initialize models
const db = {
  sequelize,  // This is the Sequelize instance itself
  Sequelize,  // The Sequelize library (we'll use it for validation, etc.)
  User,       // Add your models here
  Video,
};

export default db;
