import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server"
import { GoogleGenerativeAI } from "@google/generative-ai";

const http = httpRouter();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ""); 

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error("CLERK_WEBHOOK_SECRET is not set");
        }

        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature ");
        const svix_timestamp = request.headers.get("svix-timestamp");

        if (!svix_id || !svix_signature || !svix_timestamp) {
            throw new Response("Missing svix headers", {
                status: 400,
            });
        }

        const payLoad = await request.json();
        const body = JSON.stringify(payLoad);

        const wh = new Webhook(webhookSecret);
        let evt: WebhookEvent;
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-signature": svix_signature,
                "svix-timestamp": svix_timestamp,
            }) as WebhookEvent;
        } catch (error) {
            console.error("Webhook verification failed:", error);
            return new Response("Error occured", { status: 400 });
        }

        const eventType = evt.type;

        if (eventType === "user.created") {
            const { id, first_name, last_name, image_url, email_addresses } = evt.data;

            const email = email_addresses[0].email_address;

            const name = `${first_name || ""} ${last_name || ""}`.trim();

            try {
                await ctx.runMutation(api.users.syncUser, { 
                    email, 
                    name, 
                    image: image_url || "",
                    clerkId: id
                })
            } catch (error) {
                console.log("Error syncing user:", error);
                return new Response("Error occured", { status: 400 });
            }
        }

        if (eventType === "user.updated") {
            const { id, first_name, last_name, image_url, email_addresses } = evt.data;

            const email = email_addresses[0].email_address;

            const name = `${first_name || ""} ${last_name || ""}`.trim();

            try {
                await ctx.runMutation(api.users.updateUser, { 
                    email, 
                    name, 
                    image: image_url || "",
                    clerkId: id
                })
            } catch (error) {
                console.log("Error syncing user:", error);
                return new Response("Error occured", { status: 400 });
            }
        }

        return new Response("Webhook received", { status: 200 });
    }),
});

// // validate and fix workout plan to ensure it has proper numeric types
// function validateWorkoutPlan(plan: any) {
//   const validatedPlan = {
//     schedule: plan.schedule,
//     exercises: plan.exercises.map((exercise: any) => ({
//       day: exercise.day,
//       routines: exercise.routines.map((routine: any) => ({
//         name: routine.name,
//         sets: typeof routine.sets === "number" ? routine.sets : parseInt(routine.sets) || 1,
//         reps: typeof routine.reps === "number" ? routine.reps : parseInt(routine.reps) || 10,
//       })),
//     })),
//   };
//   return validatedPlan;
// }

// // validate diet plan to ensure it strictly follows schema
// function validateDietPlan(plan: any) {
//   // only keep the fields we want
//   const validatedPlan = {
//     dailyCalories: plan.dailyCalories,
//     meals: plan.meals.map((meal: any) => ({
//       name: meal.name,
//       foods: meal.foods,
//     })),
//   };
//   return validatedPlan;
// }

// http.route({
//   path: "/vapi/generate-program",
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     try {
//       const payload = await request.json();
//       const {
//         user_id,
//         age,
//         height,
//         weight,
//         injuries,
//         workout_days,
//         fitness_goal,
//         fitness_level,
//         equipment_available,
//         dietery_restrictions,
//         diet_type,
//         gender,
//       } = payload;

//       console.log("Received payload:", payload);

//       const model = genAI.getGenerativeModel({
//         model: "gemini-2.0-flash-001",
//         generationConfig: {
//           temperature: 0.4,
//           topP: 0.95,
//           responseMimeType: "application/json",
//         },
//       });

//       // Your existing workout and diet plan generation logic
//       const workoutPrompt = `...`; // Your prompt
//       const workoutResponse = await model.generateContent(workoutPrompt);
//       const workoutPlanText = workoutResponse.response.text();
//       let workoutPlan = JSON.parse(workoutPlanText);
//       workoutPlan = validateWorkoutPlan(workoutPlan);

//       const dietPrompt = `...`; // Your prompt
//       const dietResponse = await model.generateContent(dietPrompt);
//       const dietPlanText = dietResponse.response.text();
//       let dietPlan = JSON.parse(dietPlanText);
//       dietPlan = validateDietPlan(dietPlan);

//       const planId = await ctx.runMutation(api.plans.createPlan, {
//         userId: user_id,
//         dietPlan,
//         isActive: true,
//         workoutPlan,
//         name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
//       });

//       return new Response(
//         JSON.stringify({
//           success: true,
//           data: { planId, workoutPlan, dietPlan },
//         }),
//         {
//           status: 200,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     } catch (error) {
//       console.error("Error creating program:", error);
//       return new Response(
//         JSON.stringify({ success: false, error: "Error occurred while generating plans" }),
//         { status: 500, headers: { "Content-Type": "application/json" } }
//       );
//     }
//   }),
// });

export default http;

