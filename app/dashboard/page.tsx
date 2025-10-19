'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Sparkles, Copy, LogOut, Loader2, Image } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  
  // Form state
  const [topic, setTopic] = useState('')
  const [slideCount, setSlideCount] = useState(5)
  const [tone, setTone] = useState('friendly')
  const [targetAudience, setTargetAudience] = useState('')
  
  // Results state
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [tips, setTips] = useState('')
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setUser(session.user)

    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    setProfile(profileData)
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setGenerating(true)
    setGeneratedCaptions([])
    setHashtags([])
    setTips('')

    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          slideCount,
          tone,
          targetAudience,
          contentType: 'carousel'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to generate captions')
        return
      }

      setGeneratedCaptions(data.data.captions)
      setHashtags(data.data.hashtags)
      setTips(data.data.tips)
      setProfile({ ...profile, credits_remaining: data.data.creditsRemaining })
      
      toast.success('Captions generated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  function copyAllCaptions() {
    const allText = generatedCaptions.map((caption, i) => `Slide ${i + 1}:\n${caption}`).join('\n\n') + 
      '\n\nHashtags:\n' + hashtags.map(h => `#${h}`).join(' ')
    navigator.clipboard.writeText(allText)
    toast.success('All captions copied!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              <Sparkles className="w-8 h-8 text-purple-600" />
              SmartCaption
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Credits:</span>
                <span className="ml-2 font-semibold text-purple-600">
                  {profile?.credits_remaining || 0}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Image className="w-6 h-6 text-purple-600" />
              Create Your Carousel Captions
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your carousel about? *
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 5 morning habits that changed my life"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of slides: {slideCount}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none"
                >
                  <option value="friendly">Friendly & Conversational</option>
                  <option value="professional">Professional</option>
                  <option value="motivational">Motivational & Energetic</option>
                  <option value="educational">Educational</option>
                  <option value="humorous">Humorous & Fun</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience (optional)
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., entrepreneurs, fitness enthusiasts"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !topic.trim() || (profile?.credits_remaining || 0) <= 0}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Captions
                  </>
                )}
              </button>

              {(profile?.credits_remaining || 0) <= 0 && (
                <p className="text-sm text-red-600 text-center">
                  No credits remaining. Upgrade to Pro for unlimited captions!
                </p>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Generated Captions</h2>
              {generatedCaptions.length > 0 && (
                <button
                  onClick={copyAllCaptions}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>
              )}
            </div>

            {generatedCaptions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Your generated captions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Captions */}
                {generatedCaptions.map((caption, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-purple-700">
                        Slide {index + 1}
                      </span>
                      <button
                        onClick={() => copyToClipboard(caption, `Slide ${index + 1}`)}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{caption}</p>
                  </div>
                ))}

                {/* Hashtags */}
                {hashtags.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Recommended Hashtags
                      </span>
                      <button
                        onClick={() => copyToClipboard(hashtags.map(h => `#${h}`).join(' '), 'Hashtags')}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, index) => (
                        <span key={index} className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {tips && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>💡 Tip:</strong> {tips}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}