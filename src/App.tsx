import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Search, Utensils, Clock, Users, ChefHat, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Recipe {
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: "Mudah" | "Sedang" | "Sulit";
  ingredients: string[];
  instructions: string[];
}

export default function App() {
  const [foodName, setFoodName] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = async () => {
    if (!foodName.trim()) return;

    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("API Key tidak ditemukan. Pastikan 'GEMINI_API_KEY' sudah diatur di Environment Variables Vercel.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Berikan resep lengkap untuk masakan: ${foodName}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              cookTime: { type: Type.STRING },
              servings: { type: Type.NUMBER },
              difficulty: { type: Type.STRING, enum: ["Mudah", "Sedang", "Sulit"] },
              ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["name", "description", "prepTime", "cookTime", "servings", "difficulty", "ingredients", "instructions"]
          },
          systemInstruction: "Anda adalah koki profesional yang ahli dalam masakan Indonesia dan Internasional. Berikan resep dalam bahasa Indonesia yang jelas, akurat, dan lezat."
        }
      });

      const result = JSON.parse(response.text || "{}");
      setRecipe(result);
    } catch (err: any) {
      console.error("Error generating recipe:", err);
      let msg = "Gagal mendapatkan resep.";
      if (err?.message) {
        msg = `Error: ${err.message}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-orange-100">
      {/* Hero Section */}
      <header className="relative py-16 px-4 overflow-hidden bg-white border-b border-stone-200">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10"><Utensils size={120} /></div>
          <div className="absolute bottom-10 right-10"><ChefHat size={120} /></div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
                <ChefHat size={32} />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-stone-900">
              Resep<span className="text-orange-500">Ku</span>
            </h1>
            <p className="text-stone-500 text-lg mb-8 max-w-xl mx-auto">
              Temukan inspirasi memasak setiap hari dengan bantuan AI. Masukkan nama makanan yang Anda inginkan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <Input
                  placeholder="Contoh: Nasi Goreng Spesial..."
                  className="pl-10 h-12 bg-white border-stone-200 focus:ring-orange-500 focus:border-orange-500 rounded-xl shadow-sm"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generateRecipe()}
                />
              </div>
              <Button 
                onClick={generateRecipe} 
                disabled={loading || !foodName.trim()}
                className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-200 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Sparkles className="mr-2" size={18} />}
                Cari Resep
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content Section */}
      <main className="max-w-4xl mx-auto py-12 px-4">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-6">
                  <Skeleton className="h-10 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardHeader>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center"
            >
              <p className="text-red-600 font-medium">{error}</p>
              <Button variant="outline" onClick={generateRecipe} className="mt-4 border-red-200 text-red-600 hover:bg-red-100">
                Coba Lagi
              </Button>
            </motion.div>
          )}

          {recipe && !loading && (
            <motion.div
              key="recipe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-4 border-orange-200 text-orange-600 bg-orange-50 px-3 py-1">
                  Resep AI
                </Badge>
                <h2 className="text-4xl font-bold text-stone-900 mb-3">{recipe.name}</h2>
                <p className="text-stone-500 italic max-w-2xl mx-auto">"{recipe.description}"</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center">
                  <div className="flex justify-center text-orange-500 mb-2"><Clock size={20} /></div>
                  <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Persiapan</div>
                  <div className="font-semibold">{recipe.prepTime}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center">
                  <div className="flex justify-center text-orange-500 mb-2"><ChefHat size={20} /></div>
                  <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Masak</div>
                  <div className="font-semibold">{recipe.cookTime}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center">
                  <div className="flex justify-center text-orange-500 mb-2"><Users size={20} /></div>
                  <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Porsi</div>
                  <div className="font-semibold">{recipe.servings} Orang</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center">
                  <div className="flex justify-center text-orange-500 mb-2"><Sparkles size={20} /></div>
                  <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Kesulitan</div>
                  <div className="font-semibold">{recipe.difficulty}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card className="border-stone-100 shadow-sm overflow-hidden rounded-2xl">
                  <CardHeader className="bg-stone-50/50 border-b border-stone-100">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Utensils size={20} className="text-orange-500" />
                      Bahan-bahan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-stone-700">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-stone-900">
                    <ChefHat size={20} className="text-orange-500" />
                    Cara Membuat
                  </h3>
                  <div className="space-y-6">
                    {recipe.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <div className="pt-1 text-stone-700 leading-relaxed">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!recipe && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-6 rounded-full bg-stone-100 text-stone-300 mb-4">
                <Utensils size={48} />
              </div>
              <p className="text-stone-400">Belum ada resep yang dicari.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-stone-200 text-center text-stone-400 text-sm">
        <p>© 2026 ResepKu AI. Dibuat dengan cinta untuk para pecinta kuliner.</p>
      </footer>
    </div>
  );
}
