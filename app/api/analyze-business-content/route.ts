import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { BusinessContentRequestBody } from '@/types/api';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json() as BusinessContentRequestBody;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt parameter' },
        { status: 400 }
      );
    }

    console.log('🧠 Analyzing business content with Claude...');

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content_response = response.content[0];
    if (content_response.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse Claude's JSON response
    let jsonText = content_response.text.trim();
    
    // Extract JSON from response
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }
    
    // Clean up JSON
    jsonText = jsonText
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ');

    const analysis = JSON.parse(jsonText);
    console.log(`✅ Business analysis complete: ${analysis.businessType}`);
    
    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Business content analysis failed:', error);
    return NextResponse.json({
      businessType: 'Unknown Business',
      industry: 'general',
      services: [],
      location: ['uk'],
      targetAudience: 'General audience',
      businessModel: 'Unknown',
      extractedKeywords: [],
      confidence: 10
    }, { status: 500 });
  }
}