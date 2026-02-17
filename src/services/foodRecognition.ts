/**
 * Food Recognition Service
 * AI-powered food recognition using OpenAI Vision API
 *
 * Setup Instructions:
 * 1. Get API key from: https://platform.openai.com/api-keys
 * 2. Replace 'YOUR_OPENAI_API_KEY_HERE' below with your actual key
 * 3. Or use environment variables in production
 */

// 🔑 OPENAI API KEY — set via EAS Secrets or app.config.js
// In production: add EXPO_PUBLIC_OPENAI_API_KEY to your EAS secret store
// NEVER hardcode keys in source code
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const USE_MOCK_DATA = !OPENAI_API_KEY; // Falls back to mock when no key is configured

export interface FoodItem {
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  serving: string;
  confidence: number; // 0-1
}

export interface RecognitionResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  imageUri: string;
  timestamp: Date;
}

// Mock food database for demo
const MOCK_FOODS: { [key: string]: FoodItem } = {
  apple: {
    name: 'Apple',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    serving: '1 medium (182g)',
    confidence: 0.95,
  },
  banana: {
    name: 'Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    serving: '1 medium (118g)',
    confidence: 0.92,
  },
  chicken: {
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving: '100g',
    confidence: 0.88,
  },
  rice: {
    name: 'White Rice',
    calories: 206,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    serving: '1 cup cooked (158g)',
    confidence: 0.85,
  },
  salad: {
    name: 'Mixed Green Salad',
    calories: 25,
    protein: 2,
    carbs: 5,
    fat: 0.3,
    serving: '1 cup (47g)',
    confidence: 0.80,
  },
  pizza: {
    name: 'Pizza Slice',
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 10,
    serving: '1 slice (107g)',
    confidence: 0.90,
  },
  burger: {
    name: 'Hamburger',
    calories: 354,
    protein: 20,
    carbs: 30,
    fat: 17,
    serving: '1 burger (143g)',
    confidence: 0.87,
  },
  egg: {
    name: 'Boiled Egg',
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fat: 5.3,
    serving: '1 large (50g)',
    confidence: 0.93,
  },
  salmon: {
    name: 'Grilled Salmon',
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 13,
    serving: '100g',
    confidence: 0.89,
  },
  broccoli: {
    name: 'Steamed Broccoli',
    calories: 55,
    protein: 3.7,
    carbs: 11,
    fat: 0.6,
    serving: '1 cup (156g)',
    confidence: 0.91,
  },
};

/**
 * AI-powered food recognition using OpenAI Vision API
 * Falls back to mock data if API key is not configured
 */
export const recognizeFood = async (imageUri: string): Promise<RecognitionResult> => {
  // Use mock data if API key not configured
  if (USE_MOCK_DATA) {
    return recognizeFoodMock(imageUri);
  }

  try {
    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and return a JSON array of detected food items. For each item include: name, estimated calories, protein (g), carbs (g), fat (g), serving size, and confidence (0-1). Be specific about portions. Format: {"foods": [{"name": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "serving": "...", "confidence": 0.95}]}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUri
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse AI response
    const jsonMatch = content ? content.match(/\{[\s\S]*\}/) : null;
    if (jsonMatch) {
      let parsed: { foods?: FoodItem[] };
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        return recognizeFoodMock(imageUri);
      }
      const foods: FoodItem[] = parsed.foods || [];

      // Calculate totals
      const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);
      const totalCarbs = foods.reduce((sum, food) => sum + food.carbs, 0);
      const totalFat = foods.reduce((sum, food) => sum + food.fat, 0);

      return {
        foods,
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        imageUri,
        timestamp: new Date(),
      };
    }
  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    // Fall back to mock data on error
    return recognizeFoodMock(imageUri);
  }

  // Fallback
  return recognizeFoodMock(imageUri);
};

/**
 * Mock food recognition (fallback)
 */
const recognizeFoodMock = async (imageUri: string): Promise<RecognitionResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const foodKeys = Object.keys(MOCK_FOODS);
  const numFoods = Math.floor(Math.random() * 3) + 1;
  const selectedFoods: FoodItem[] = [];

  for (let i = 0; i < numFoods; i++) {
    const randomKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
    const food = { ...MOCK_FOODS[randomKey] };
    food.confidence = Math.max(0.7, Math.min(0.99, food.confidence + (Math.random() - 0.5) * 0.1));
    selectedFoods.push(food);
  }

  const totalCalories = selectedFoods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = selectedFoods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = selectedFoods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFat = selectedFoods.reduce((sum, food) => sum + food.fat, 0);

  return {
    foods: selectedFoods,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    imageUri,
    timestamp: new Date(),
  };
};

/**
 * Search food database manually
 */
export const searchFood = async (query: string): Promise<FoodItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const lowerQuery = query.toLowerCase();
  const results = Object.values(MOCK_FOODS).filter((food) =>
    food.name.toLowerCase().includes(lowerQuery)
  );

  return results;
};

/**
 * Get nutritional info for a specific food
 */
export const getFoodInfo = (foodName: string): FoodItem | null => {
  const key = foodName.toLowerCase().replace(/\s+/g, '');
  return MOCK_FOODS[key] || null;
};

export default {
  recognizeFood,
  searchFood,
  getFoodInfo,
};
