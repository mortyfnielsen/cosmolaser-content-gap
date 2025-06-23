import { useState, useMemo } from 'react';
import { AnalysisResults } from '@/app/page';

interface ResultsProps {
  results: AnalysisResults;
  onExport: () => void;
}

type GapKeyword = {
  keyword: string;
  search_volume: number;
  competition: number;
  competition_level: string;
  cpc: number;
  competitor_rank: number;
  competitor_url: string;
  competitor: string;
  priority_score?: number;
  priority_level?: string;
};

export default function Results({ results, onExport }: ResultsProps) {
  const [sortBy, setSortBy] = useState<keyof GapKeyword>('search_volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Process and flatten the content gaps data
  const processedGaps = useMemo(() => {
    const gaps: GapKeyword[] = [];
    
    Object.entries(results.content_gaps).forEach(([competitor, gapKeywords]) => {
      gapKeywords.forEach((gap: unknown) => {
        if (typeof gap === 'object' && gap && 'keyword' in gap) {
          const gapData = gap as Record<string, unknown>;
          // Calculate priority score if not present
          const search_volume = (gapData.search_volume as number) || 0;
          const competition = (gapData.competition as number) || 0;
          const cpc = (gapData.cpc as number) || 0;
          
          let priority_score = 0;
          let priority_level = 'LAV';
          
          if (search_volume > 0 || competition > 0) {
            const volume_score = search_volume === 0 ? 0 : 
                               search_volume < 10 ? 1 :
                               search_volume < 50 ? 2 :
                               search_volume < 100 ? 3 :
                               search_volume < 500 ? 4 : 5;
            
            const comp_score = competition === 0 ? 5 :
                              competition < 0.2 ? 4 :
                              competition < 0.4 ? 3 :
                              competition < 0.6 ? 2 :
                              competition < 0.8 ? 1 : 0;
            
            const cpc_bonus = Math.min(cpc / 10, 1);
            priority_score = (volume_score * 0.5) + (comp_score * 0.4) + (cpc_bonus * 0.1);
            
            priority_level = priority_score >= 4 ? 'HØJ' :
                           priority_score >= 2.5 ? 'MEDIUM' : 'LAV';
          }

          gaps.push({
            ...(gapData as GapKeyword),
            competitor,
            priority_score: Math.round(priority_score * 100) / 100,
            priority_level
          });
        }
      });
    });
    
    return gaps;
  }, [results.content_gaps]);

  // Filter and sort the data
  const filteredAndSortedGaps = useMemo(() => {
    let filtered = processedGaps;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(gap => 
        gap.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gap.competitor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(gap => gap.priority_level === filterPriority);
    }

    // Sort the data
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      const comparison = Number(aValue) - Number(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [processedGaps, sortBy, sortOrder, filterPriority, searchTerm]);

  const handleSort = (column: keyof GapKeyword) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: keyof GapKeyword) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HØJ': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LAV': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: processedGaps.length,
      high_priority: processedGaps.filter(g => g.priority_level === 'HØJ').length,
      avg_search_volume: Math.round(processedGaps.reduce((sum, g) => sum + (g.search_volume || 0), 0) / processedGaps.length),
      competitors: Object.keys(results.content_gaps).length
    };
  }, [processedGaps, results.content_gaps]);

  return (
    <div className="mt-8 space-y-6">
      {/* Results Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📊 Analyse Resultater</h2>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          📥 Download Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Content Gaps</div>
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Høj Prioritet</div>
          <div className="text-2xl font-bold text-red-600">{stats.high_priority}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Gns. Search Volume</div>
          <div className="text-2xl font-bold text-green-600">{stats.avg_search_volume}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Konkurrenter</div>
          <div className="text-2xl font-bold text-purple-600">{stats.competitors}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Søg efter keywords eller konkurrenter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Alle prioriteter</option>
          <option value="HØJ">Høj prioritet</option>
          <option value="MEDIUM">Medium prioritet</option>
          <option value="LAV">Lav prioritet</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('keyword')}
                >
                  Keyword {getSortIcon('keyword')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('competitor')}
                >
                  Konkurrent {getSortIcon('competitor')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('search_volume')}
                >
                  Search Volume {getSortIcon('search_volume')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('competition')}
                >
                  Competition {getSortIcon('competition')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('cpc')}
                >
                  CPC {getSortIcon('cpc')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('priority_score')}
                >
                  Prioritet {getSortIcon('priority_score')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('competitor_rank')}
                >
                  Rank {getSortIcon('competitor_rank')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedGaps.slice(0, 100).map((gap, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {gap.keyword}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {gap.competitor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gap.search_volume?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((gap.competition || 0) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(gap.cpc || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(gap.priority_level || 'LAV')}`}>
                      {gap.priority_level} ({gap.priority_score})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gap.competitor_rank || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedGaps.length > 100 && (
          <div className="px-6 py-3 bg-gray-50 text-sm text-gray-700">
            Viser første 100 resultater af {filteredAndSortedGaps.length} total
          </div>
        )}
        
        {filteredAndSortedGaps.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            Ingen resultater fundet med de valgte filtre
          </div>
        )}
      </div>
    </div>
  );
}