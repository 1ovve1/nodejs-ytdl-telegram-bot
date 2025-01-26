import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../sequelize';  // Import the configured Sequelize instance
import User from './users';
import Video from "./videos";
import VideoFormat from "./video_formats";
import ChatUser from "./chat_users";
import Chat from "./chats";
import AudioFormat from "./audio_formats";

// Initialize models
const db = {
  sequelize,  // This is the Sequelize instance itself
  Sequelize,  // The Sequelize library (we'll use it for validation, etc.)
  User,       // Add your models here
  Video,
  VideoFormat,
  AudioFormat,
  Chat,
  ChatUser,
};

export default db;
