import { useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Loader2, Calendar, UserCheck } from "lucide-react";

interface Recommendation {
  lecturerId: string;
  lecturerName: string;
  matchScore: number;
  matchReason: string;
  suggestedSlots: string[];
}

export function FindLecturer() {
  const navigate = useNavigate();
  const recommendLecturers = useAction(api.ai.recommendLecturers);
  
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDates, setPreferredDates] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Recommendation[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      const recommendations = await recommendLecturers({
        topic,
        description,
        preferredDates,
      }) as Recommendation[];
      setResults(recommendations);
    } catch (err: any) {
      setError(err.message || "Failed to get recommendations.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Lecturer Match
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Describe your consultation needs and our AI will find the best lecturers for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Main Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Machine Learning Thesis"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you want to discuss in detail..."
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preferred Timeline
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredDates}
                    onChange={(e) => setPreferredDates(e.target.value)}
                    placeholder="e.g. Next week, Monday or Tuesday"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Find Matches
                    </>
                  )}
                </button>
              </form>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Sparkles className="w-12 h-12 text-primary animate-pulse relative z-10" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">AI is thinking...</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Matching your needs with our lecturers' expertise</p>
              </div>
            ) : results ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                  <UserCheck className="w-5 h-5 text-green-500" />
                  Top Recommendations
                </h3>
                
                {results.map((rec, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden transition-all hover:shadow-md">
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                        Best Match
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{rec.lecturerName}</h4>
                        <div className="flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-yellow-700 dark:text-primary px-2 py-1 rounded-full text-sm font-bold">
                          {rec.matchScore}% Match
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {rec.matchReason}
                      </p>
                      
                      {rec.suggestedSlots && rec.suggestedSlots.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-wrap gap-2">
                            {rec.suggestedSlots.map((slot, sIdx) => (
                              <span key={sIdx} className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="sm:w-40 flex flex-col justify-end">
                      <button
                        onClick={() => navigate(`/student/book?lecturerId=${rec.lecturerId}`)}
                        className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
                <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm mb-4">
                  <UserCheck className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ready to find a match</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-sm text-center">
                  Fill out the form on the left to get personalized AI recommendations for your consultation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
