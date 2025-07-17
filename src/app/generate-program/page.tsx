"use client";

// Import UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation'; // Keep for default navigation styling if using custom buttons styled like default
import 'swiper/css/pagination'; // Keep for default pagination styling if using custom dots

// Convex hooks and API
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api"; // Adjust path if necessary

// Clerk for user info
import { useUser } from "@clerk/nextjs";

// Next.js router for navigation
import { useRouter } from "next/navigation";

// React hooks
import { useState, useRef } from "react";
import type { Swiper as SwiperRef } from 'swiper'; // Type for Swiper instance

const GenerateProgramPage = () => {
  const { user } = useUser();
  const router = useRouter();

  const generateAndCreatePlan = useAction(api.gemini.generateAndCreatePlan);

  const swiperRef = useRef<SwiperRef | null>(null);

  // State for form inputs
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [equipmentAvailable, setEquipmentAvailable] = useState<string[]>([]);
  const [workoutDays, setWorkoutDays] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [dietType, setDietType] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [injuries, setInjuries] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Helper for equipment checkboxes
  const handleEquipmentChange = (item: string, checked: boolean) => {
    if (checked) {
      setEquipmentAvailable((prev) => [...prev, item]);
    } else {
      setEquipmentAvailable((prev) => prev.filter((d) => d !== item));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!user?.id) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }

    const args = {
      userId: user.id,
      fitnessGoal,
      fitnessLevel,
      equipmentAvailable,
      workoutDays,
      dietaryRestrictions,
      dietType,
      gender: gender === "not specified" ? undefined : gender,
      age: age ? parseInt(age, 10) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      injuries,
    };

    try {
      const result = await generateAndCreatePlan(args);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      } else {
        setError("Failed to generate and save plan. Please try again.");
      }
    } catch (err: any) {
      console.error("Error during plan generation/creation:", err);
      setError("An unexpected error occurred while generating your plan. Model might be overloaded. Please try again later.");
      router.push("/profile");

    } finally {
      setIsLoading(false);
    }
  };

  const goNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const goPrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const totalSlides = 10; // Make sure this matches the number of SwiperSlides you have
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden pb-10 pt-24
                    bg-gradient-to-br from-gray-950 to-black via-gray-800 animate-gradient-xy">
      <div className="container mx-auto px-4 h-full max-w-4xl">
        {/* Page Title & Description */}
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-100 drop-shadow-lg">
            Personalized AI Fitness Coach
          </h1>
          <p className="text-gray-300 mt-4 md:text-lg max-w-2xl mx-auto opacity-90">
            Answer a few quick questions and let our AI create a bespoke fitness and nutrition plan just for you.
          </p>
        </div>

        {/* Main Card Container */}
        <Card className="p-8 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700
                        rounded-xl transition-all duration-300 hover:shadow-purple-500/20 relative">

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 rounded-t-xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-900 to-blue-100 transition-all duration-500 ease-out"
              style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
            ></div>
          </div>

          <CardHeader className="text-center pb-6 border-b border-gray-800 mb-6">
            <CardTitle className="text-3xl font-bold text-white tracking-wide">
              {`Question ${currentSlideIndex + 1} of ${totalSlides}`}
            </CardTitle>
            <p className="text-gray-400 mt-2">Let's get to know you better!</p>
          </CardHeader>

          <CardContent className="min-h-[350px] flex items-center justify-center">
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              spaceBetween={0} // No space needed with card-per-slide
              slidesPerView={1}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true, // Makes dots grow/shrink
                el: '.swiper-pagination', // Custom pagination element
              }}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={(swiper) => setCurrentSlideIndex(swiper.activeIndex)}
              allowTouchMove={!isLoading}
              className="w-full h-full" // Ensure Swiper takes full available space
            >
              {/* Slide 1: Fitness Goal */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="fitnessGoal" className="text-2xl font-semibold mb-6 text-white">What's your primary fitness goal?</Label>
                  <Input
                    id="fitnessGoal"
                    type="text"
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    placeholder="e.g., Lose weight, Build muscle, Improve endurance"
                    className="max-w-md bg-gray-800 border-gray-700 text-white placeholder-gray-500
                               focus:border-primary focus:ring-primary focus:ring-1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-3">Be specific for best results!</p>
                </div>
              </SwiperSlide>

              {/* Slide 2: Fitness Level */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="fitnessLevel" className="text-2xl font-semibold mb-6 text-white">What's your current fitness level?</Label>
                  <Select value={fitnessLevel} onValueChange={setFitnessLevel} required>
                    <SelectTrigger id="fitnessLevel" className="max-w-md bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SwiperSlide>

              {/* Slide 3: Gender */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="gender" className="text-2xl font-semibold mb-6 text-white">What is your gender?</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender" className="max-w-md bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select gender (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="not specified">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-3">This helps personalize calorie and macro estimates.</p>
                </div>
              </SwiperSlide>

              {/* Slide 4: Age */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="age" className="text-2xl font-semibold mb-6 text-white">How old are you?</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 30"
                    min="0"
                    className="max-w-xs bg-gray-800 border-gray-700 text-white placeholder-gray-500
                               focus:border-primary focus:ring-primary focus:ring-1"
                  />
                </div>
              </SwiperSlide>

              {/* Slide 5: Height */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="height" className="text-2xl font-semibold mb-6 text-white">What's your height (in cm)?</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g., 175"
                    min="0"
                    className="max-w-xs bg-gray-800 border-gray-700 text-white placeholder-gray-500
                               focus:border-primary focus:ring-primary focus:ring-1"
                  />
                </div>
              </SwiperSlide>

              {/* Slide 6: Weight */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="weight" className="text-2xl font-semibold mb-6 text-white">What's your weight (in kg)?</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 70"
                    min="0"
                    className="max-w-xs bg-gray-800 border-gray-700 text-white placeholder-gray-500
                               focus:border-primary focus:ring-primary focus:ring-1"
                  />
                </div>
              </SwiperSlide>

              {/* Slide 7: Injuries */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="injuries" className="text-2xl font-semibold mb-6 text-white">Any injuries or health concerns?</Label>
                  <Textarea
                    id="injuries"
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    placeholder="e.g., Knee pain, Shoulder injury, back issues (optional)"
                    className="max-w-md min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder-gray-500
                               focus:border-primary focus:ring-primary focus:ring-1"
                  />
                  <p className="text-sm text-gray-500 mt-3">This helps us create a safe and effective plan.</p>
                </div>
              </SwiperSlide>

              {/* Slide 8: Equipment Available */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label className="text-2xl font-semibold mb-6 text-white">What equipment do you have access to?</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 justify-center mt-2 max-w-lg">
                    {[
                      "Bodyweight", "Dumbbells", "Resistance Bands", "Gym Access",
                      "Barbell", "Kettlebell", "Machines", "None"
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-3">
                        <Checkbox
                          id={`equipment-${item}`}
                          checked={equipmentAvailable.includes(item)}
                          onCheckedChange={(checked) =>
                            handleEquipmentChange(item, checked as boolean)
                          }
                          className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor={`equipment-${item}`} className="text-lg text-gray-300 cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 9: Preferred Workout Days/Frequency */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="workoutDays" className="text-2xl font-semibold mb-6 text-white">How often do you want to work out?</Label>
                  <Input
                    id="workoutDays"
                    type="text"
                    value={workoutDays}
                    onChange={(e) => setWorkoutDays(e.target.value)}
                    placeholder="e.g., 3 times a week, Monday/Wednesday/Friday"
                    className="max-w-md bg-gray-800 border-gray-700 text-white placeholder-gray-500
                               focus:border-primary focus:ring-primary focus:ring-1"
                  />
                  <p className="text-sm text-gray-500 mt-3">Be realistic with your schedule!</p>
                </div>
              </SwiperSlide>

              {/* Slide 10: Diet Type & Restrictions (combined for brevity) */}
              <SwiperSlide>
                <div className="flex flex-col items-center justify-center p-4">
                  <Label htmlFor="dietType" className="text-2xl font-semibold mb-6 text-white">Any dietary preferences or restrictions?</Label>
                  <Input
                    id="dietType"
                    type="text"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    placeholder="e.g., Vegetarian, Keto, Mediterranean (optional)"
                    className="mb-4 max-w-md bg-gray-800 border-gray-700 text-white placeholder-gray-500
                               focus:border-primary focus:ring-primary focus:ring-1"
                  />
                  <Textarea
                    id="dietaryRestrictions"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    placeholder="e.g., Gluten-free, Nut allergy, No dairy (optional)"
                    className="max-w-md min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder-gray-500
                               focus:border-primary focus:ring-primary focus:ring-1"
                  />
                  <p className="text-sm text-gray-500 mt-3">Helps us tailor your meal suggestions.</p>
                </div>
              </SwiperSlide>

            </Swiper>
          </CardContent>

          {/* Swiper Pagination (custom position for better look) */}
          <div className="swiper-pagination flex justify-center mt-6 mb-4"></div>

          <CardFooter className="flex justify-between items-center pt-6 border-t border-gray-800 relative">
            {error && (
              <div className="text-red-400 text-sm text-center w-full absolute -top-8 left-0 right-0">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-400 text-sm text-center w-full absolute -top-8 left-0 right-0">
                Plan generated and saved successfully! Redirecting...
              </div>
            )}

            <Button
              onClick={goPrev}
              disabled={currentSlideIndex === 0 || isLoading}
              variant="outline"
              className="px-8 py-3 text-lg font-semibold rounded-full
                         bg-gray-700 text-gray-200 border-gray-600
                         hover:bg-gray-600 hover:border-gray-500
                         transition-colors duration-200"
            >
              Back
            </Button>

            {currentSlideIndex < totalSlides - 1 ? (
              <Button
                onClick={goNext}
                disabled={isLoading}
                className="px-8 py-3 text-lg font-semibold rounded-full
                           bg-gradient-to-r from-blue-500 to-aqua-600 text-white shadow-lg
                           hover:from-purple-700 hover:to-pink-700
                           transition-colors duration-200"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 text-lg font-semibold rounded-full
                           bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg
                           hover:from-green-600 hover:to-emerald-700
                           transition-colors duration-200"
              >
                {isLoading ? "Generating & Saving..." : "Generate My Plan"}
              </Button>
            )}
          </CardFooter>
          {/* Swiper default navigation buttons (hidden by default) */}
          <div className="swiper-button-prev hidden"></div>
          <div className="swiper-button-next hidden"></div>
        </Card>
      </div>
    </div>
  );
};

export default GenerateProgramPage;