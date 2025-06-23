import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { AnalysisResults } from '@/app/page';

// --- Priority Score Logic (ported from Python) ---
function calculatePriorityScore(search_volume = 0, competition = 0, cpc = 0) {
  let volume_score = 0;
  if (search_volume >= 500) volume_score = 5;
  else if (search_volume >= 100) volume_score = 4;
  else if (search_volume >= 50) volume_score = 3;
  else if (search_volume >= 10) volume_score = 2;
  else if (search_volume > 0) volume_score = 1;

  let comp_score = 0;
  if (competition < 0.2) comp_score = 5;
  else if (competition < 0.4) comp_score = 4;
  else if (competition < 0.6) comp_score = 3;
  else if (competition < 0.8) comp_score = 2;
  else if (competition < 1) comp_score = 1;
  
  const cpc_bonus = Math.min(cpc / 10, 1);
  const priority_score = (volume_score * 0.5) + (comp_score * 0.4) + (cpc_bonus * 0.1);
  
  let priority_level = 'LAV';
  if (priority_score >= 4) priority_level = 'HØJ';
  else if (priority_score >= 2.5) priority_level = 'MEDIUM';

  return { priority_score: parseFloat(priority_score.toFixed(2)), priority_level };
}


// --- API Route Handler ---
export async function POST(request: NextRequest) {
  try {
    const results: AnalysisResults = await request.json();
    const workbook = new ExcelJS.Workbook();

    // --- Content Gaps Sheet ---
    const gapsSheet = workbook.addWorksheet('Content_Gaps');
    gapsSheet.columns = [
      { header: 'Competitor', key: 'competitor', width: 25 },
      { header: 'Missing_Keyword', key: 'keyword', width: 35 },
      { header: 'Priority_Score', key: 'priority_score', width: 15 },
      { header: 'Priority_Level', key: 'priority_level', width: 15 },
      { header: 'Search_Volume', key: 'search_volume', width: 15 },
      { header: 'Competition', key: 'competition', width: 15 },
      { header: 'CPC', key: 'cpc', width: 10 },
      { header: 'Competitor_Rank', key: 'competitor_rank', width: 15 },
      { header: 'Competitor_URL', key: 'competitor_url', width: 50 },
    ];

    let gapsData: any[] = [];
    for (const [competitor, gap_keywords] of Object.entries(results.content_gaps)) {
      for (const gap_item of gap_keywords as any[]) {
        const { priority_score, priority_level } = calculatePriorityScore(
            gap_item.search_volume,
            gap_item.competition,
            gap_item.cpc
        );
        gapsData.push({ ...gap_item, competitor, priority_score, priority_level });
      }
    }

    gapsData.sort((a, b) => b.priority_score - a.priority_score || b.search_volume - a.search_volume);
    gapsSheet.addRows(gapsData);
    gapsSheet.getRow(1).font = { bold: true };


    // --- Target Keywords Sheet ---
    const targetSheet = workbook.addWorksheet('Target_Keywords');
    targetSheet.columns = [
        { header: 'Keyword', key: 'keyword', width: 35 },
        { header: 'Search_Volume', key: 'search_volume', width: 15 },
        { header: 'Rank', key: 'rank', width: 10 },
    ];
    targetSheet.addRows(results.target_keywords as any[]);
    targetSheet.getRow(1).font = { bold: true };
    

    // --- Competitor Keyword Sheets ---
    for (const [competitor, keywords] of Object.entries(results.competitor_data)) {
        const sheetName = competitor.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 31);
        const competitorSheet = workbook.addWorksheet(sheetName);
        competitorSheet.columns = [
            { header: 'Keyword', key: 'keyword', width: 35 },
            { header: 'Search_Volume', key: 'search_volume', width: 15 },
            { header: 'Rank', key: 'rank', width: 10 },
        ];
        competitorSheet.addRows(keywords as any[]);
        competitorSheet.getRow(1).font = { bold: true };
    }

    // --- Send Response ---
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="content_gap_analysis.xlsx"',
      },
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Failed to export results' }, { status: 500 });
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