/**
 * Claude-powered Smart Image Optimization Analysis
 * Provides intelligent image optimization strategies based on content and context
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ImageOptimizationStrategy {
  overallScore: number; // 0-100
  optimizationPotential: 'high' | 'medium' | 'low';
  estimatedSavings: {
    totalSizeReduction: string; // e.g., "2.1 MB"
    loadTimeImprovement: string; // e.g., "1.2 seconds"
    bandwidthSavings: string; // e.g., "40% reduction"
  };
  imageAnalysis: {
    totalImages: number;
    largeImages: number;
    averageSize: number;
    formatDistribution: Record<string, number>;
    contextuallyImportant: number;
  };
  recommendations: Array<{
    category: 'format' | 'compression' | 'sizing' | 'delivery' | 'lazy-loading';
    priority: 'critical' | 'important' | 'moderate';
    title: string;
    description: string;
    implementation: string;
    expectedSavings: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tools: string[];
  }>;
  quickWins: Array<{
    action: string;
    description: string;
    timeRequired: string;
    expectedImprovement: string;
    priority: number;
  }>;
  modernFormats: {
    webpOpportunity: string;
    avifOpportunity: string;
    svgOpportunity: string;
    implementationGuide: string;
  };
  lazyLoadingStrategy: {
    recommended: boolean;
    implementation: string;
    expectedBenefit: string;
    priorityImages: string[];
  };
  cdnRecommendations: {
    recommended: boolean;
    benefits: string[];
    implementationSteps: string[];
  };
}

export async function analyzeImageOptimizationWithClaude(
  domain: string,
  htmlContent: string,
  largeImageDetails: Array<{ imageUrl: string; pageUrl: string; sizeKB: number }>
): Promise<ImageOptimizationStrategy> {
  try {
    console.log(`🖼️ Analyzing image optimization with Claude for ${domain}`);

    // Analyze image context from HTML
    const imageElements = htmlContent.match(/<img[^>]+>/gi) || [];
    const totalImages = imageElements.length;
    
    // Extract image attributes for analysis
    const imageAnalysis = imageElements.map(img => {
      const src = img.match(/src="([^"]+)"/i)?.[1] || '';
      const alt = img.match(/alt="([^"]+)"/i)?.[1] || '';
      const className = img.match(/class="([^"]+)"/i)?.[1] || '';
      const loading = img.match(/loading="([^"]+)"/i)?.[1] || '';
      return { src, alt, className, loading };
    }).slice(0, 10); // Analyze first 10 images

    // Calculate total large image size
    const totalLargeImageSize = largeImageDetails.reduce((sum, img) => sum + img.sizeKB, 0);
    const averageImageSize = largeImageDetails.length > 0 ? totalLargeImageSize / largeImageDetails.length : 0;

    const prompt = `As an image optimization expert, analyze this website's images and provide actionable optimization recommendations.

WEBSITE: ${domain}

IMAGE STATISTICS:
- Total images on page: ${totalImages}
- Large images (>100KB): ${largeImageDetails.length}
- Total size of large images: ${totalLargeImageSize.toLocaleString()} KB
- Average large image size: ${Math.round(averageImageSize).toLocaleString()} KB

LARGE IMAGES DETAILS:
${largeImageDetails.slice(0, 5).map(img => 
  `- ${img.imageUrl} (${img.sizeKB}KB)`
).join('\n')}

SAMPLE IMAGE ELEMENTS:
${imageAnalysis.slice(0, 5).map(img => 
  `<img src="${img.src}" alt="${img.alt}" class="${img.className}" loading="${img.loading}">`
).join('\n')}

WEBSITE CONTENT SAMPLE:
${htmlContent.substring(0, 1500)}

Provide a comprehensive image optimization analysis in this JSON format:

{
  "overallScore": [0-100 current image optimization score],
  "optimizationPotential": "[high/medium/low]",
  "estimatedSavings": {
    "totalSizeReduction": "[e.g., '1.8 MB']",
    "loadTimeImprovement": "[e.g., '0.8 seconds']",
    "bandwidthSavings": "[e.g., '35% reduction']"
  },
  "imageAnalysis": {
    "totalImages": ${totalImages},
    "largeImages": ${largeImageDetails.length},
    "averageSize": ${Math.round(averageImageSize)},
    "formatDistribution": {"jpg": 60, "png": 30, "gif": 5, "svg": 5},
    "contextuallyImportant": [number of images that are crucial for user experience]
  },
  "recommendations": [
    {
      "category": "[format/compression/sizing/delivery/lazy-loading]",
      "priority": "[critical/important/moderate]",
      "title": "[Clear, actionable title]",
      "description": "[User-friendly explanation of the issue and benefit]",
      "implementation": "[Step-by-step implementation guide]",
      "expectedSavings": "[Specific savings expected]",
      "difficulty": "[Easy/Medium/Hard]",
      "tools": ["List of recommended tools"]
    }
  ],
  "quickWins": [
    {
      "action": "[Specific action to take]",
      "description": "[What this accomplishes]",
      "timeRequired": "[How long it takes]",
      "expectedImprovement": "[Specific improvement]",
      "priority": [1-5 ranking]
    }
  ],
  "modernFormats": {
    "webpOpportunity": "[Analysis of WebP conversion opportunity]",
    "avifOpportunity": "[Analysis of AVIF potential]",
    "svgOpportunity": "[Opportunities to use SVG]",
    "implementationGuide": "[How to implement modern formats]"
  },
  "lazyLoadingStrategy": {
    "recommended": [true/false],
    "implementation": "[How to implement lazy loading]",
    "expectedBenefit": "[Expected performance improvement]",
    "priorityImages": ["List of images that should NOT be lazy loaded"]
  },
  "cdnRecommendations": {
    "recommended": [true/false],
    "benefits": ["List of CDN benefits for this site"],
    "implementationSteps": ["Steps to implement image CDN"]
  }
}

Focus on:
1. Making image optimization concepts understandable for non-developers
2. Prioritizing optimizations by impact and ease of implementation
3. Providing specific file size and performance improvements
4. Considering the website's purpose and user experience
5. Recommending appropriate tools and services
6. Balancing optimization with image quality

Consider the website's apparent business type and target audience when making recommendations.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    try {
      const analysis = JSON.parse(content.text);
      console.log(`✅ Claude image optimization analysis complete for ${domain}`);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse Claude image optimization response:', parseError);
      console.log('Raw response:', content.text);
      
      // Return fallback analysis
      return getFallbackImageOptimizationAnalysis(largeImageDetails, totalImages);
    }

  } catch (error) {
    console.error('Claude image optimization analysis failed:', error);
    return getFallbackImageOptimizationAnalysis(largeImageDetails, totalImages);
  }
}

function getFallbackImageOptimizationAnalysis(
  largeImageDetails: Array<{ imageUrl: string; pageUrl: string; sizeKB: number }>,
  totalImages: number
): ImageOptimizationStrategy {
  const totalSize = largeImageDetails.reduce((sum, img) => sum + img.sizeKB, 0);
  const hasLargeImages = largeImageDetails.length > 0;
  
  // Calculate optimization potential
  const estimatedSavings = Math.round(totalSize * 0.6); // Assume 60% compression possible
  const optimizationPotential = hasLargeImages ? (largeImageDetails.length > 5 ? 'high' : 'medium') : 'low';
  
  return {
    overallScore: hasLargeImages ? 40 : 75,
    optimizationPotential,
    estimatedSavings: {
      totalSizeReduction: `${(estimatedSavings / 1024).toFixed(1)} MB`,
      loadTimeImprovement: `${(estimatedSavings / 1000).toFixed(1)} seconds`,
      bandwidthSavings: '40-60% reduction'
    },
    imageAnalysis: {
      totalImages,
      largeImages: largeImageDetails.length,
      averageSize: largeImageDetails.length > 0 ? Math.round(totalSize / largeImageDetails.length) : 0,
      formatDistribution: { jpg: 70, png: 25, gif: 3, svg: 2 },
      contextuallyImportant: Math.min(5, totalImages)
    },
    recommendations: [
      {
        category: 'compression',
        priority: 'important',
        title: 'Compress Large Images',
        description: 'Your images are larger than necessary, slowing down page loading',
        implementation: 'Use image compression tools to reduce file sizes without losing quality',
        expectedSavings: `${(estimatedSavings / 1024).toFixed(1)} MB reduction`,
        difficulty: 'Easy',
        tools: ['TinyPNG', 'ImageOptim', 'Squoosh']
      }
    ],
    quickWins: [
      {
        action: 'Compress the largest images first',
        description: 'Focus on images over 500KB for maximum impact',
        timeRequired: '30 minutes',
        expectedImprovement: 'Faster page loading',
        priority: 1
      }
    ],
    modernFormats: {
      webpOpportunity: 'Converting to WebP could reduce image sizes by 25-35%',
      avifOpportunity: 'AVIF format could provide even better compression',
      svgOpportunity: 'Consider SVG for simple graphics and icons',
      implementationGuide: 'Use modern image formats with fallbacks for older browsers'
    },
    lazyLoadingStrategy: {
      recommended: totalImages > 3,
      implementation: 'Add loading="lazy" attribute to images below the fold',
      expectedBenefit: 'Faster initial page load',
      priorityImages: ['Hero images', 'Above-the-fold content']
    },
    cdnRecommendations: {
      recommended: hasLargeImages,
      benefits: ['Faster image delivery', 'Reduced server load', 'Automatic optimization'],
      implementationSteps: ['Choose an image CDN', 'Update image URLs', 'Configure optimization settings']
    }
  };
}