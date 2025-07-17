// convex/gemini.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- Utility functions for validation ---
// These functions ensure the AI's output, even if slightly malformed,
// conforms to the schema expected by your `plans.createPlan` mutation.
function validateWorkoutPlan(plan: any) {
  if (!plan || typeof plan !== 'object') {
    throw new Error("Invalid workout plan structure from AI.");
  }
  return {
    schedule: Array.isArray(plan.schedule) ? plan.schedule.filter((s: any) => typeof s === 'string') : [],
    exercises: Array.isArray(plan.exercises) ? plan.exercises.map((exercise: any) => ({
      day: typeof exercise.day === "string" ? exercise.day : "Unknown Day",
      routines: Array.isArray(exercise.routines) ? exercise.routines.map((routine: any) => {
        // More robust parsing for sets and reps
        // Convert to string first to handle cases where it might be null/undefined or even a number for parseInt
        const sets = typeof routine.sets === "number" ? routine.sets : parseInt(String(routine.sets)) || 1;
        const reps = typeof routine.reps === "number" ? routine.reps : parseInt(String(routine.reps)) || 10;
        return {
          name: typeof routine.name === "string" ? routine.name : "Unknown Exercise",
          sets: isNaN(sets) ? 1 : sets, // Default to 1 if NaN after parseInt
          reps: isNaN(reps) ? 10 : reps, // Default to 10 if NaN after parseInt
        };
      }) : [],
    })) : [],
  };
}

function validateDietPlan(plan: any) {
  if (!plan || typeof plan !== 'object') {
    throw new Error("Invalid diet plan structure from AI.");
  }
  return {
    // More robust parsing for dailyCalories
    dailyCalories: typeof plan.dailyCalories === "number" ? plan.dailyCalories : parseInt(String(plan.dailyCalories)) || 0,
    meals: Array.isArray(plan.meals) ? plan.meals.map((meal: any) => ({ // Fixed: meal.foods.map to meal.meals.map
      name: typeof meal.name === "string" ? meal.name : "Unknown Meal",
      foods: Array.isArray(meal.foods) ? meal.foods.filter((f: any) => typeof f === 'string') : [],
    })) : [],
  };
}
// --- End Utility functions ---

// Explicitly type the return value of the action handler
type GeneratedPlanResult = {
  success: boolean;
  planId?: string; // Optional because it might not be set on failure
  workoutPlan?: ReturnType<typeof validateWorkoutPlan>; // Use ReturnType for inferred types
  dietPlan?: ReturnType<typeof validateDietPlan>;
  message: string;
};

export const generateAndCreatePlan = action({
  args: {
    userId: v.string(),
    age: v.optional(v.number()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    injuries: v.optional(v.string()),
    workoutDays: v.optional(v.string()),
    fitnessGoal: v.string(),
    fitnessLevel: v.string(),
    equipmentAvailable: v.array(v.string()),
    dietaryRestrictions: v.optional(v.string()),
    dietType: v.optional(v.string()),
    gender: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GeneratedPlanResult> => { // Added Promise<GeneratedPlanResult>
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return { success: false, message: "Gemini API key is not configured." };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        responseMimeType: "application/json",
      },
    });

    const basePrompt = `You are an expert fitness and nutrition coach.
    Generate a detailed and structured JSON object containing a workout plan and a daily diet plan.
    
    User Profile:
    - User ID: ${args.userId}
    - Gender: ${args.gender || 'not specified'}
    - Age: ${args.age ? `${args.age} years` : 'not specified'}
    - Height: ${args.height ? `${args.height} cm` : 'not specified'}
    - Weight: ${args.weight ? `${args.weight} kg` : 'not specified'}
    - Injuries: ${args.injuries || 'none'}
    - Fitness Goal: ${args.fitnessGoal}
    - Fitness Level: ${args.fitnessLevel}
    - Equipment Available: ${args.equipmentAvailable.length > 0 ? args.equipmentAvailable.join(", ") : 'none'}
    - Preferred Workout Days: ${args.workoutDays || 'not specified'}
    - Diet Type: ${args.dietType || 'not specified'}
    - Dietary Restrictions: ${args.dietaryRestrictions || 'none'}

    **Output Format Requirement:**
    The response MUST be a single, valid JSON object with the following structure.
    Strictly adhere to this structure. Ensure:
    1.  All numeric values (like "sets", "reps", "dailyCalories") are actual JSON numbers, NOT strings or text descriptions (e.g., use 10, not "10", and definitely NOT "as many as possible").
    2.  Arrays are actual JSON arrays.
    3.  Strings are actual JSON strings.
    4.  The entire response is ONLY the JSON object, with no introductory text, markdown backticks, or commentary.
    
    \`\`\`json
    {
      "workoutPlan": {
        "schedule": ["Monday", "Wednesday", "Friday"],
        "exercises": [
          {
            "day": "Monday",
            "routines": [
              {"name": "Squats", "sets": 3, "reps": 10},
              {"name": "Push-ups", "sets": 3, "reps": 15}
            ]
          },
          {
            "day": "Wednesday",
            "routines": [
              {"name": "Deadlifts", "sets": 3, "reps": 8},
              {"name": "Overhead Press", "sets": 3, "reps": 10}
            ]
          }
        ]
      },
      "dietPlan": {
        "dailyCalories": 2000,
        "meals": [
          {"name": "Breakfast", "foods": ["Oatmeal", "Berries", "Protein Powder"]},
          {"name": "Lunch", "foods": ["Chicken Salad", "Mixed Greens", "Olive Oil Dressing"]},
          {"name": "Dinner", "foods": ["Baked Salmon", "Sweet Potatoes", "Broccoli"]}
        ]
      }
    }
    \`\`\`
    
    Provide realistic and personalized suggestions for exercises, sets, reps, daily calories, and meal components based on the user's profile.
    The plan should be comprehensive for a typical week.
    `;

    try {
      const result = await model.generateContent(basePrompt);
      let text = result.response.text(); // Get the raw text from Gemini

      console.log("Raw Gemini Response Text (before processing):", text);

      // Attempt to clean the text: remove markdown code blocks if present
      // This is a common issue even with responseMimeType: "application/json"
      if (text.startsWith("```json") && text.endsWith("```")) {
        text = text.substring(7, text.length - 3).trim();
      }
      // If it starts with just ``` and ends with ``` (no language specifier)
      if (text.startsWith("```") && text.endsWith("```")) {
        text = text.substring(3, text.length - 3).trim();
      }

      console.log("Processed Gemini Response Text (before JSON.parse):", text);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch (jsonError: any) {
        console.error("Failed to parse Gemini JSON:", jsonError);
        console.error("Problematic text (which failed JSON.parse):", text);
        return { success: false, message: `Gemini did not return valid JSON: ${jsonError.message}. Raw text: ${text.substring(0, Math.min(text.length, 200))}...` };
      }

      const workoutPlan = validateWorkoutPlan(parsedResponse.workoutPlan);
      const dietPlan = validateDietPlan(parsedResponse.dietPlan);

      // Now, call your createPlan mutation to save the generated plan
      const planName = `${args.fitnessGoal} Plan - ${new Date().toLocaleDateString()}`;
      const planId = await ctx.runMutation(api.plans.createPlan, {
        userId: args.userId,
        dietPlan,
        isActive: true,
        workoutPlan,
        name: planName,
      });

      return {
        success: true,
        planId,
        workoutPlan,
        dietPlan,
        message: "Plan generated and saved successfully!",
      };

    } catch (error: any) {
      console.error("Error generating plan with Gemini:", error);
      return { success: false, message: `Error from AI service: ${error.message || "Unknown error"}` };
    }
  },
});