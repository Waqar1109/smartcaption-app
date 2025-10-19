import Link from 'next/link'
import { Sparkles, Zap, Target, TrendingUp, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <Sparkles className="w-8 h-8 text-purple-600" />
            SmartCaption
          </div>
          <Link 
            href="/auth/signin" 
            className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Built specifically for Instagram Carousels & TikTok Series
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Stop Staring at Blank<br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Caption Boxes
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered captions for every slide of your carousel. Generate engaging hooks, 
            informative content, and perfect CTAs in seconds.
          </p>

          <Link 
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg transition"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-gray-500 mt-4">
            ✨ 10 free captions to get started
          </p>
        </div>

        {/* Demo Preview */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Your Input:</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Topic:</span>
                    <p className="font-medium">5 Tips for Morning Productivity</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Slides:</span>
                    <p className="font-medium">5 slides</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tone:</span>
                    <p className="font-medium">Motivational & Energetic</p>
                  </div>
                </div>
              </div>
              
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">AI Generated:</h3>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 space-y-2 text-sm">
                  <p><strong>Slide 1:</strong> ☀️ Transform your mornings in 30 days! Save this →</p>
                  <p><strong>Slide 2:</strong> Wake up 15 mins earlier. No, seriously...</p>
                  <p><strong>Slide 3:</strong> Cold water on your face = instant alertness</p>
                  <p className="text-gray-500">+ 2 more slides...</p>
                  <div className="pt-2 border-t border-purple-200">
                    <span className="text-xs text-purple-700 font-medium">
                      #MorningRoutine #ProductivityHacks #SelfImprovement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Content Creators Love Us
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Sparkles className="w-6 h-6" />,
              title: "Slide-by-Slide Captions",
              description: "Generate unique captions for each carousel slide with perfect flow"
            },
            {
              icon: <Target className="w-6 h-6" />,
              title: "Hooks That Stop Scrolling",
              description: "AI-crafted opening lines that grab attention instantly"
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              title: "Smart Hashtag Strategy",
              description: "Get trending + niche hashtags tailored to your content"
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: "CTA Optimization",
              description: "Perfect call-to-actions for every slide's purpose"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 border-t">
        <p>© 2025 SmartCaption.app - Making caption creation effortless</p>
      </footer>
    </div>
  )
}
