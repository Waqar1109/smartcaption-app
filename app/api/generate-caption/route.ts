import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { topic, slideCount, tone, targetAudience, contentType } = body

    // Validate input
    if (!topic || !slideCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check user credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_remaining, subscription_tier')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.credits_remaining <= 0) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 403 })
    }

    // Generate captions using Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert Instagram and TikTok caption writer. You specialize in creating engaging, scroll-stopping captions for carousel posts. Generate captions that are authentic, engaging, and optimized for social media engagement.`
          },
          {
            role: 'user',
            content: `Create ${slideCount} captions for an Instagram carousel about: "${topic}"
            
Tone: ${tone || 'Friendly and engaging'}
Target Audience: ${targetAudience || 'General audience'}
Content Type: ${contentType || 'carousel'}

Requirements:
- Slide 1: Create a HOOK that stops scrolling. Use emojis strategically. Make it curiosity-driven.
- Slides 2-${slideCount - 1}: Informative, valuable content. Each slide should flow naturally.
- Slide ${slideCount}: Strong CTA (call-to-action) that encourages engagement (save, share, comment, follow).
- Keep captions concise (under 100 characters per slide when possible)
- Use line breaks for readability
- Include relevant emojis
- At the end, suggest 10-15 relevant hashtags (mix of popular and niche)

Return the response in this exact JSON format:
{
  "captions": ["Slide 1 caption here", "Slide 2 caption here", ...],
  "hashtags": ["hashtag1", "hashtag2", ...],
  "tips": "Brief tip about using these captions effectively"
}`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      })
    })

    if (!groqResponse.ok) {
      console.error('Groq API error:', await groqResponse.text())
      return NextResponse.json({ error: 'Failed to generate caption' }, { status: 500 })
    }

    const groqData = await groqResponse.json()
    const content = groqData.choices[0].message.content

    // Parse the JSON response from the AI
    let parsedContent
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        parsedContent = JSON.parse(content)
      }
    } catch (_e) {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    // Save to database
    const { data: captionRecord, error: insertError } = await supabase
      .from('captions')
      .insert({
        user_id: session.user.id,
        content_type: contentType || 'carousel',
        slide_count: slideCount,
        topic,
        tone,
        target_audience: targetAudience,
        generated_captions: parsedContent.captions,
        hashtags: parsedContent.hashtags,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
    }

    // Deduct credit
    await supabase
      .from('profiles')
      .update({ credits_remaining: profile.credits_remaining - 1 })
      .eq('id', session.user.id)

    // Log usage
    await supabase
      .from('usage_logs')
      .insert({
        user_id: session.user.id,
        action: 'generate_caption',
        metadata: { topic, slideCount, contentType }
      })

    return NextResponse.json({
      success: true,
      data: {
        id: captionRecord?.id,
        captions: parsedContent.captions,
        hashtags: parsedContent.hashtags,
        tips: parsedContent.tips,
        creditsRemaining: profile.credits_remaining - 1
      }
    })

  } catch (error) {
    console.error('Error generating caption:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
