// Structured Data Validation Service
// Validates JSON-LD, Microdata, and RDFa schema markup

export interface StructuredDataItem {
  type: string; // e.g., "Organization", "Article", "Product"
  format: 'JSON-LD' | 'Microdata' | 'RDFa';
  location: string; // Where found in HTML
  isValid: boolean;
  errors: string[];
  warnings: string[];
  raw?: string; // Raw markup
}

export interface StructuredDataValidationResult {
  totalItems: number;
  validItems: number;
  invalidItems: number;
  items: StructuredDataItem[];
  recommendations: string[];
}

/**
 * Extract and validate structured data from HTML
 */
export async function validateStructuredData(html: string): Promise<StructuredDataValidationResult> {
  const items: StructuredDataItem[] = [];

  // Extract JSON-LD structured data
  const jsonLdItems = extractJsonLd(html);
  items.push(...jsonLdItems);

  // Extract Microdata
  const microdataItems = extractMicrodata(html);
  items.push(...microdataItems);

  // Extract RDFa (basic detection)
  const rdfaItems = extractRdfa(html);
  items.push(...rdfaItems);

  // Calculate summary
  const validItems = items.filter(item => item.isValid).length;
  const invalidItems = items.filter(item => !item.isValid).length;

  // Generate recommendations
  const recommendations = generateRecommendations(items);

  return {
    totalItems: items.length,
    validItems,
    invalidItems,
    items,
    recommendations
  };
}

/**
 * Extract and validate JSON-LD structured data
 */
function extractJsonLd(html: string): StructuredDataItem[] {
  const items: StructuredDataItem[] = [];
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  let index = 0;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    index++;
    const jsonContent = match[1].trim();

    try {
      const data = JSON.parse(jsonContent);
      const schemas = Array.isArray(data) ? data : [data];

      schemas.forEach((schema, schemaIndex) => {
        const item = validateJsonLdSchema(schema, index, schemaIndex);
        items.push(item);
      });
    } catch (error) {
      items.push({
        type: 'Unknown',
        format: 'JSON-LD',
        location: `JSON-LD block #${index}`,
        isValid: false,
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`],
        warnings: [],
        raw: jsonContent.substring(0, 200)
      });
    }
  }

  return items;
}

/**
 * Validate individual JSON-LD schema
 */
function validateJsonLdSchema(schema: Record<string, unknown>, blockIndex: number, schemaIndex: number): StructuredDataItem {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get schema type
  const type = schema['@type'] as string || 'Unknown';
  const context = schema['@context'] as string;

  // Validate @context
  if (!context) {
    errors.push('Missing @context property');
  } else if (!context.includes('schema.org')) {
    errors.push('Invalid @context - must reference schema.org');
  }

  // Validate @type
  if (!schema['@type']) {
    errors.push('Missing @type property');
  }

  // Type-specific validation
  if (type === 'Organization') {
    validateOrganizationSchema(schema, errors, warnings);
  } else if (type === 'LocalBusiness') {
    validateLocalBusinessSchema(schema, errors, warnings);
  } else if (type === 'Article' || type === 'BlogPosting' || type === 'NewsArticle') {
    validateArticleSchema(schema, errors, warnings);
  } else if (type === 'Product') {
    validateProductSchema(schema, errors, warnings);
  } else if (type === 'WebPage' || type === 'WebSite') {
    validateWebPageSchema(schema, errors, warnings);
  } else if (type === 'Person') {
    validatePersonSchema(schema, errors, warnings);
  } else if (type === 'BreadcrumbList') {
    validateBreadcrumbSchema(schema, errors, warnings);
  } else if (type === 'HowTo') {
    validateHowToSchema(schema, errors, warnings);
  }

  return {
    type,
    format: 'JSON-LD',
    location: `JSON-LD block #${blockIndex}${schemaIndex > 0 ? `, item ${schemaIndex + 1}` : ''}`,
    isValid: errors.length === 0,
    errors,
    warnings,
    raw: JSON.stringify(schema, null, 2).substring(0, 200)
  };
}

/**
 * Validate Organization schema
 */
function validateOrganizationSchema(schema: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (!schema.name) {
    errors.push('Organization: Missing required "name" property');
  }

  if (!schema.url && !schema.logo) {
    warnings.push('Organization: Missing recommended "url" or "logo" property');
  }

  // Check for logo requirements
  if (schema.logo) {
    const logo = schema.logo as Record<string, unknown>;
    if (typeof logo === 'object') {
      if (!logo['@type'] || logo['@type'] !== 'ImageObject') {
        warnings.push('Organization: logo should be an ImageObject');
      }
      if (!logo.url) {
        errors.push('Organization: logo must have a "url" property');
      }
    }
  }
}

/**
 * Validate LocalBusiness schema
 */
function validateLocalBusinessSchema(schema: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (!schema.name) {
    errors.push('LocalBusiness: Missing required "name" property');
  }

  if (!schema.address) {
    errors.push('LocalBusiness: Missing required "address" property');
  } else {
    const address = schema.address as Record<string, unknown>;
    if (!address.streetAddress && !address.addressLocality) {
      warnings.push('LocalBusiness: address should include streetAddress or addressLocality');
    }
  }

  if (!schema.telephone && !schema.email) {
    warnings.push('LocalBusiness: Missing recommended contact information (telephone or email)');
  }
}

/**
 * Validate Article schema
 */
function validateArticleSchema(schema: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (!schema.headline) {
    errors.push('Article: Missing required "headline" property');
  }

  if (!schema.author) {
    errors.push('Article: Missing required "author" property');
  }

  if (!schema.datePublished) {
    errors.push('Article: Missing required "datePublished" property');
  }

  if (!schema.image) {
    warnings.push('Article: Missing recommended "image" property for rich results');
  }

  if (!schema.publisher) {
    warnings.push('Article: Missing recommended "publisher" property');
  }
}

/**
 * Validate Product schema
 */
function validateProductSchema(schema: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (!schema.name) {
    errors.push('Product: Missing required "name" property');
  }

  if (!schema.image) {
    errors.push('Product: Missing required "image" property');
  }

  if (!schema.offers) {
    warnings.push('Product: Missing recommended "offers" property');
  } else {
    const offers = schema.offers as Record<string, unknown>;
    if (!offers.price && !offers.priceCurrency) {
      warnings.push('Product: offers should include price and priceCurrency');
    }
  }

  if (!schema.aggregateRating && !schema.review) {
    warnings.push('Product: Missing recommended "aggregateRating" or "review" for rich results');
  }
}

/**
 * Validate WebPage/WebSite schema
 */
function validateWebPageSchema(schema: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (!schema.name && !schema.headline) {
    warnings.push('WebPage: Missing recommended "name" or "headline" property');
  }

  if (!schema.url) {
    warnings.push('WebPage: Missing recommended "url" property');
  }
}

/**
 * Validate Person schema
 */
function validatePersonSchema(schema: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (!schema.name) {
    errors.push('Person: Missing required "name" property');
  }
}

/**
 * Validate BreadcrumbList schema
 */
function validateBreadcrumbSchema(schema: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (!schema.itemListElement) {
    errors.push('BreadcrumbList: Missing required "itemListElement" property');
  } else {
    const items = schema.itemListElement as Array<Record<string, unknown>>;
    if (!Array.isArray(items) || items.length === 0) {
      errors.push('BreadcrumbList: itemListElement must be a non-empty array');
    } else {
      items.forEach((item, index) => {
        if (!item['@type'] || item['@type'] !== 'ListItem') {
          errors.push(`BreadcrumbList: item ${index + 1} must have @type "ListItem"`);
        }
        if (!item.position) {
          errors.push(`BreadcrumbList: item ${index + 1} missing required "position" property`);
        }
        if (!item.name && !item.item) {
          errors.push(`BreadcrumbList: item ${index + 1} must have "name" or "item" property`);
        }
      });
    }
  }
}

/**
 * Validate HowTo schema
 */
function validateHowToSchema(schema: Record<string, unknown>, errors: string[], warnings: string[]): void {
  // Required: name
  if (!schema.name) {
    errors.push('HowTo: Missing required "name" property');
  }

  // Required: step
  if (!schema.step) {
    errors.push('HowTo: Missing required "step" property');
  } else {
    const steps = schema.step as Array<Record<string, unknown>>;

    if (!Array.isArray(steps)) {
      errors.push('HowTo: "step" must be an array of HowToStep or HowToSection');
    } else if (steps.length === 0) {
      errors.push('HowTo: "step" array cannot be empty');
    } else {
      // Validate each step
      steps.forEach((step, index) => {
        const stepType = step['@type'] as string;

        if (!stepType || (stepType !== 'HowToStep' && stepType !== 'HowToSection')) {
          errors.push(`HowTo: step ${index + 1} must have @type "HowToStep" or "HowToSection"`);
        }

        if (stepType === 'HowToStep') {
          // HowToStep requires text or itemListElement
          if (!step.text && !step.itemListElement) {
            errors.push(`HowTo: step ${index + 1} missing required "text" or "itemListElement" property`);
          }

          // Optional but recommended: name, url, image
          if (!step.name) {
            warnings.push(`HowTo: step ${index + 1} missing recommended "name" property`);
          }
        }

        if (stepType === 'HowToSection') {
          // HowToSection requires name and itemListElement
          if (!step.name) {
            errors.push(`HowTo: section ${index + 1} missing required "name" property`);
          }
          if (!step.itemListElement) {
            errors.push(`HowTo: section ${index + 1} missing required "itemListElement" property`);
          }
        }
      });
    }
  }

  // Recommended properties
  if (!schema.image) {
    warnings.push('HowTo: Missing recommended "image" property for rich results');
  }

  if (!schema.totalTime && !schema.estimatedCost) {
    warnings.push('HowTo: Consider adding "totalTime" or "estimatedCost" for better rich results');
  }

  if (!schema.tool && !schema.supply) {
    warnings.push('HowTo: Consider adding "tool" or "supply" arrays for comprehensive instructions');
  }
}

/**
 * Extract and validate Microdata
 */
function extractMicrodata(html: string): StructuredDataItem[] {
  const items: StructuredDataItem[] = [];

  // Look for itemtype attributes
  const itemtypeRegex = /itemtype=["']https?:\/\/schema\.org\/([^"']+)["']/gi;

  let match;
  const foundTypes = new Set<string>();

  while ((match = itemtypeRegex.exec(html)) !== null) {
    const type = match[1];
    foundTypes.add(type);
  }

  // Create items for found types
  foundTypes.forEach(type => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if required properties are present
    const hasItemprop = html.includes('itemprop=');

    if (!hasItemprop) {
      warnings.push('Microdata markup found but no itemprop attributes detected');
    }

    items.push({
      type,
      format: 'Microdata',
      location: 'HTML body (Microdata)',
      isValid: errors.length === 0,
      errors,
      warnings
    });
  });

  return items;
}

/**
 * Extract and validate RDFa (basic)
 */
function extractRdfa(html: string): StructuredDataItem[] {
  const items: StructuredDataItem[] = [];

  // Look for RDFa vocab attributes
  const rdfaRegex = /vocab=["']https?:\/\/schema\.org\/?["']/gi;

  if (rdfaRegex.test(html)) {
    // Extract typeof attributes
    const typeofRegex = /typeof=["']([^"']+)["']/gi;
    const foundTypes = new Set<string>();

    let match;
    while ((match = typeofRegex.exec(html)) !== null) {
      foundTypes.add(match[1]);
    }

    foundTypes.forEach(type => {
      items.push({
        type,
        format: 'RDFa',
        location: 'HTML body (RDFa)',
        isValid: true, // Basic validation only
        errors: [],
        warnings: ['RDFa validation is basic - use Google Rich Results Test for detailed validation']
      });
    });
  }

  return items;
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(items: StructuredDataItem[]): string[] {
  const recommendations: string[] = [];

  if (items.length === 0) {
    recommendations.push('No structured data found - add schema markup to improve search visibility');
    recommendations.push('Start with Organization schema for business information');
    return recommendations;
  }

  const invalidItems = items.filter(item => !item.isValid);

  if (invalidItems.length > 0) {
    recommendations.push(`Fix ${invalidItems.length} invalid structured data item(s) to qualify for rich results`);
    recommendations.push('Use Google Rich Results Test to validate your schema markup');
  }

  // Check for common missing schemas
  const types = new Set(items.map(item => item.type));

  if (!types.has('Organization') && !types.has('LocalBusiness')) {
    recommendations.push('Add Organization or LocalBusiness schema for better brand recognition');
  }

  if (!types.has('BreadcrumbList')) {
    recommendations.push('Add BreadcrumbList schema to show breadcrumbs in search results');
  }

  // Check format preferences
  const hasJsonLd = items.some(item => item.format === 'JSON-LD');
  const hasMicrodata = items.some(item => item.format === 'Microdata');

  if (hasMicrodata && !hasJsonLd) {
    recommendations.push('Consider migrating to JSON-LD format - easier to maintain and debug');
  }

  return recommendations;
}
