import { NextRequest, NextResponse } from 'next/server';
import { Settings } from '@/app/page';

// --- DataForSEO Client (TypeScript Version) ---
class DataForSEOClient {
  private login: string;
  private password: string;
  private baseUrl = 'https://api.dataforseo.com/v3';

  constructor() {
    this.login = process.env.DATAFORSEO_LOGIN || '';
    this.password = process.env.DATAFORSEO_PASSWORD || '';
    if (!this.login || !this.password) {
      throw new Error('DataForSEO credentials are not set in environment variables.');
    }
  }

  private async makeRequest(endpoint: string, data: any) {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      'Authorization': 'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64'),
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`DataForSEO API Error (${response.status}): ${errorBody}`);
      throw new Error(`DataForSEO API request failed with status ${response.status}`);
    }

    return response.json();
  }

  async getRankedKeywords(domain: string, limit = 1000) {
    const postData = [{
      target: domain,
      location_code: 2208, // Denmark
      language_code: 'da', // Danish
      limit: limit,
      "internal_list_limit": 100,
    }];
    return this.makeRequest('dataforseo_labs/google/ranked_keywords/live', postData);
  }
}

// --- Content Gap Analyzer Logic ---

async function getDomainKeywords(client: DataForSEOClient, domain: string, allTreatmentKeywords: string[], filter: boolean) {
  try {
    const response = await client.getRankedKeywords(domain);
    if (response.status_code === 20000 && response.tasks?.[0]?.result) {
      const items = response.tasks[0].result[0]?.items || [];
      if (!filter) {
        return items;
      }
      // Filter keywords based on treatment categories
      const isRelevant = (keyword: string) => allTreatmentKeywords.some(treatmentKw => keyword.includes(treatmentKw));
      return items.filter((item: any) => item.keyword_data?.keyword && isRelevant(item.keyword_data.keyword));
    }
    console.warn(`No keywords found or error for domain: ${domain}`, response.status_message);
    return [];
  } catch (error) {
    console.error(`Exception getting keywords for ${domain}:`, error);
    return [];
  }
}

function findContentGaps(targetKeywords: any[], competitorData: { [key: string]: any[] }) {
  const targetKwSet = new Set(targetKeywords.map(kw => kw.keyword_data?.keyword).filter(Boolean));
  const gaps: { [key: string]: any[] } = {};

  for (const [competitor, keywords] of Object.entries(competitorData)) {
    gaps[competitor] = keywords
      .filter(kw => kw.keyword_data?.keyword && !targetKwSet.has(kw.keyword_data.keyword))
      .map(kw => ({
        keyword: kw.keyword_data.keyword,
        search_volume: kw.keyword_data.keyword_info?.search_volume || 0,
        competition: kw.keyword_data.keyword_info?.competition || 0,
        cpc: kw.keyword_data.keyword_info?.cpc || 0,
        competitor_rank: kw.ranked_serp_element?.serp_item?.rank_absolute || null,
        competitor_url: kw.ranked_serp_element?.serp_item?.url || null
      }));
  }
  return gaps;
}


// --- API Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const settings: Settings = await request.json();
    const { target_domain, competitors, treatment_categories, filter_keywords } = settings;

    if (!target_domain || !competitors || competitors.length === 0) {
      return NextResponse.json({ error: 'Target domain and at least one competitor are required.' }, { status: 400 });
    }
    
    const client = new DataForSEOClient();

    // Flatten all keywords from all categories for filtering
    const allTreatmentKeywords = treatment_categories.flatMap(cat => cat.keywords);

    console.log(`Analyzing for ${target_domain} against ${competitors.length} competitors.`);
    
    const targetKeywords = await getDomainKeywords(client, target_domain, allTreatmentKeywords, filter_keywords);

    const competitorData: { [key: string]: any[] } = {};
    for (const competitor of competitors) {
      console.log(`Fetching keywords for competitor: ${competitor}`);
      competitorData[competitor] = await getDomainKeywords(client, competitor, allTreatmentKeywords, filter_keywords);
    }

    const contentGaps = findContentGaps(targetKeywords, competitorData);
    
    const results = {
      target_keywords: targetKeywords.map((kw: any) => ({
        keyword: kw.keyword_data.keyword, 
        search_volume: kw.keyword_data.keyword_info?.search_volume,
        rank: kw.ranked_serp_element?.serp_item?.rank_absolute
      })),
      competitor_data: Object.fromEntries(
        Object.entries(competitorData).map(([domain, kws]) => [
          domain,
          kws.map((kw: any) => ({
            keyword: kw.keyword_data.keyword, 
            search_volume: kw.keyword_data.keyword_info?.search_volume,
            rank: kw.ranked_serp_element?.serp_item?.rank_absolute
          }))
        ])
      ),
      content_gaps: contentGaps
    };

    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error('Analysis pipeline error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}