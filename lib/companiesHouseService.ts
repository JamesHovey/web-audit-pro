/**
 * Companies House API Integration Service
 * Provides official business classification data from UK Companies House
 */

export interface CompaniesHouseCompany {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  companyType: string;
  sicCodes: string[];
  incorporationDate?: string;
  registeredOfficeAddress?: {
    addressLine1?: string;
    locality?: string;
    postalCode?: string;
    country?: string;
  };
  natureOfBusiness?: string;
}

export interface CompaniesHouseSearchResult {
  totalResults: number;
  companies: CompaniesHouseCompany[];
  searchTerm: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface SICCodeMapping {
  code: string;
  description: string;
  businessCategory: string;
  businessSubcategory: string;
}

export class CompaniesHouseService {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.company-information.service.gov.uk';
  
  constructor() {
    // In production, get API key from environment variables
    this.apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  }
  
  /**
   * Search for companies by name
   */
  async searchCompanies(companyName: string): Promise<CompaniesHouseSearchResult> {
    if (!this.apiKey) {
      console.log('⚠️ Companies House API key not configured - using mock data');
      return this.getMockSearchResult(companyName);
    }
    
    try {
      const searchTerm = this.cleanCompanyName(companyName);
      console.log(`🔍 Searching Companies House for: "${searchTerm}"`);
      
      const response = await fetch(`${this.baseUrl}/search/companies`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: searchTerm,
          items_per_page: 5
        })
      });
      
      if (!response.ok) {
        throw new Error(`Companies House API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parseSearchResponse(data, searchTerm);
      
    } catch (error) {
      console.log(`⚠️ Companies House search failed: ${error.message}`);
      return this.getMockSearchResult(companyName);
    }
  }
  
  /**
   * Get detailed company information by company number
   */
  async getCompanyDetails(companyNumber: string): Promise<CompaniesHouseCompany | null> {
    if (!this.apiKey) {
      console.log('⚠️ Companies House API key not configured - using mock data');
      return this.getMockCompanyDetails(companyNumber);
    }
    
    try {
      console.log(`📋 Fetching company details for: ${companyNumber}`);
      
      const response = await fetch(`${this.baseUrl}/company/${companyNumber}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Companies House API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parseCompanyResponse(data);
      
    } catch (error) {
      console.log(`⚠️ Companies House company lookup failed: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Map SIC codes to business categories
   */
  mapSICCodeToBusinessType(sicCode: string): SICCodeMapping | null {
    const sicMappings: { [key: string]: SICCodeMapping } = {
      // Legal Services
      '69101': {
        code: '69101',
        description: 'Barristers at law',
        businessCategory: 'Legal Services',
        businessSubcategory: 'Family Law'
      },
      '69102': {
        code: '69102',
        description: 'Solicitors',
        businessCategory: 'Legal Services',
        businessSubcategory: 'General Practice'
      },
      '69109': {
        code: '69109',
        description: 'Other legal activities',
        businessCategory: 'Legal Services',
        businessSubcategory: 'Commercial Law'
      },
      
      // Fitness & Recreation
      '93110': {
        code: '93110',
        description: 'Operation of sports facilities',
        businessCategory: 'Fitness & Sports',
        businessSubcategory: 'Gym & Fitness'
      },
      '93199': {
        code: '93199',
        description: 'Other sports activities',
        businessCategory: 'Fitness & Sports',
        businessSubcategory: 'Sports Clubs'
      },
      
      // Entertainment
      '93290': {
        code: '93290',
        description: 'Other amusement and recreation activities',
        businessCategory: 'Entertainment & Recreation',
        businessSubcategory: 'Entertainment Centers'
      },
      '93211': {
        code: '93211',
        description: 'Amusement parks and theme parks',
        businessCategory: 'Entertainment & Recreation',
        businessSubcategory: 'Adventure Parks'
      },
      
      // Food & Hospitality
      '56101': {
        code: '56101',
        description: 'Licensed restaurants',
        businessCategory: 'Food & Hospitality',
        businessSubcategory: 'Restaurant'
      },
      '56102': {
        code: '56102',
        description: 'Unlicensed restaurants and cafes',
        businessCategory: 'Food & Hospitality',
        businessSubcategory: 'Cafe'
      },
      '55100': {
        code: '55100',
        description: 'Hotels and similar accommodation',
        businessCategory: 'Food & Hospitality',
        businessSubcategory: 'Hotel'
      },
      
      // Architecture & Design
      '71111': {
        code: '71111',
        description: 'Architectural activities',
        businessCategory: 'Architecture & Design',
        businessSubcategory: 'Residential Architecture'
      },
      '71112': {
        code: '71112',
        description: 'Urban planning and landscape architecture',
        businessCategory: 'Architecture & Design',
        businessSubcategory: 'Commercial Architecture'
      },
      
      // Digital Marketing
      '73110': {
        code: '73110',
        description: 'Advertising agencies',
        businessCategory: 'Marketing & Digital',
        businessSubcategory: 'Digital Marketing'
      },
      '73120': {
        code: '73120',
        description: 'Media representation',
        businessCategory: 'Marketing & Digital',
        businessSubcategory: 'Advertising'
      },
      '62012': {
        code: '62012',
        description: 'Business and domestic software development',
        businessCategory: 'Marketing & Digital',
        businessSubcategory: 'Web Design'
      },
      
      // Financial Services
      '69201': {
        code: '69201',
        description: 'Accounting and auditing activities',
        businessCategory: 'Financial Services',
        businessSubcategory: 'Accountancy'
      },
      '66110': {
        code: '66110',
        description: 'Administration of financial markets',
        businessCategory: 'Financial Services',
        businessSubcategory: 'Financial Planning'
      },
      
      // Healthcare
      '86210': {
        code: '86210',
        description: 'General medical practice activities',
        businessCategory: 'Healthcare & Medical',
        businessSubcategory: 'General Practice'
      },
      '86230': {
        code: '86230',
        description: 'Dental practice activities',
        businessCategory: 'Healthcare & Medical',
        businessSubcategory: 'Dental'
      }
    };
    
    return sicMappings[sicCode] || null;
  }
  
  /**
   * Extract likely company name from domain
   */
  private cleanCompanyName(domain: string): string {
    // Remove domain extensions
    let name = domain.replace(/\.(co\.uk|com|uk|org|net)$/i, '');
    
    // Remove www
    name = name.replace(/^www\./i, '');
    
    // Replace hyphens and dots with spaces
    name = name.replace(/[-\.]/g, ' ');
    
    // Handle compound names (e.g., "henryadams" -> "henry adams")
    if (!name.includes(' ') && name.length > 6) {
      // Simple heuristic for splitting compound names
      const splitAttempt = this.attemptNameSplit(name);
      if (splitAttempt) {
        name = splitAttempt;
      }
    }
    
    return name.trim();
  }
  
  /**
   * Attempt to split compound company names
   */
  private attemptNameSplit(name: string): string | null {
    // Common name patterns
    const commonWords = ['henry', 'adams', 'john', 'smith', 'david', 'wilson', 'james', 'brown'];
    
    for (const word of commonWords) {
      if (name.toLowerCase().startsWith(word)) {
        const remaining = name.slice(word.length);
        if (remaining.length >= 3) {
          return `${word} ${remaining}`;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Parse Companies House search response
   */
  private parseSearchResponse(data: any, searchTerm: string): CompaniesHouseSearchResult {
    const companies: CompaniesHouseCompany[] = [];
    
    if (data.items) {
      data.items.forEach((item: any) => {
        companies.push({
          companyNumber: item.company_number,
          companyName: item.title,
          companyStatus: item.company_status,
          companyType: item.company_type,
          sicCodes: item.sic_codes || [],
          incorporationDate: item.date_of_creation,
          registeredOfficeAddress: item.address,
          natureOfBusiness: item.description
        });
      });
    }
    
    // Determine confidence based on name similarity
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (companies.length > 0) {
      const bestMatch = companies[0];
      const similarity = this.calculateNameSimilarity(searchTerm, bestMatch.companyName);
      
      if (similarity > 0.8) confidence = 'high';
      else if (similarity > 0.6) confidence = 'medium';
    }
    
    return {
      totalResults: data.total_results || 0,
      companies,
      searchTerm,
      confidence
    };
  }
  
  /**
   * Parse individual company response
   */
  private parseCompanyResponse(data: any): CompaniesHouseCompany {
    return {
      companyNumber: data.company_number,
      companyName: data.company_name,
      companyStatus: data.company_status,
      companyType: data.type,
      sicCodes: data.sic_codes || [],
      incorporationDate: data.date_of_creation,
      registeredOfficeAddress: data.registered_office_address,
      natureOfBusiness: data.description
    };
  }
  
  /**
   * Calculate name similarity (simple implementation)
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const s1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Simple character overlap ratio
    const overlap = [...s1].filter(char => s2.includes(char)).length;
    return overlap / Math.max(s1.length, s2.length);
  }
  
  /**
   * Mock data for testing (when API key not available)
   */
  private getMockSearchResult(companyName: string): CompaniesHouseSearchResult {
    console.log(`🔧 Using mock Companies House data for: ${companyName}`);
    
    // Return empty results for testing
    return {
      totalResults: 0,
      companies: [],
      searchTerm: companyName,
      confidence: 'low'
    };
  }
  
  /**
   * Mock company details for testing
   */
  private getMockCompanyDetails(companyNumber: string): CompaniesHouseCompany | null {
    console.log(`🔧 Using mock company details for: ${companyNumber}`);
    return null;
  }
}

// Export convenience functions
export async function searchCompaniesHouse(companyName: string): Promise<CompaniesHouseSearchResult> {
  const service = new CompaniesHouseService();
  return await service.searchCompanies(companyName);
}

export async function getCompanyDetails(companyNumber: string): Promise<CompaniesHouseCompany | null> {
  const service = new CompaniesHouseService();
  return await service.getCompanyDetails(companyNumber);
}

export function mapSICCode(sicCode: string): SICCodeMapping | null {
  const service = new CompaniesHouseService();
  return service.mapSICCodeToBusinessType(sicCode);
}