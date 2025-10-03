import { publishToExchange } from "./rabbitmq";
import Recipe from "./entities/Recipe";

// Публикация событий рецептов
export const publishRecipeCreated = async (recipe: Recipe) => {
  const event = {
    type: "RECIPE_CREATED",
    data: {
      recipe_id: recipe.recipe_id,
      user_id: recipe.user_id,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.image_url,
      created_at: recipe.created_at,
    },
    timestamp: new Date().toISOString(),
  };

  await publishToExchange("recipe_events", "recipe.created", event);
};

export const publishRecipeDeleted = async (
  recipeId: number,
  userId: number
) => {
  const event = {
    type: "RECIPE_DELETED",
    data: {
      recipe_id: recipeId,
      user_id: userId,
    },
    timestamp: new Date().toISOString(),
  };

  await publishToExchange("recipe_events", "recipe.deleted", event);
};
