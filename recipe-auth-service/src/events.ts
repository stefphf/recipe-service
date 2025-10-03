import { publishToExchange } from "./rabbitmq";
import User from "./entities/User";

// Публикация событий пользователей
export const publishUserUpdated = async (user: User) => {
  const event = {
    type: "USER_UPDATED",
    data: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      profile_photo: user.profile_photo,
      bio: user.bio,
      updated_at: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  await publishToExchange("user_events", "user.updated", event);
};

export const publishUserCreated = async (user: User) => {
  const event = {
    type: "USER_CREATED",
    data: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      profile_photo: user.profile_photo,
      bio: user.bio,
      created_at: user.created_at,
    },
    timestamp: new Date().toISOString(),
  };

  await publishToExchange("user_events", "user.created", event);
};
