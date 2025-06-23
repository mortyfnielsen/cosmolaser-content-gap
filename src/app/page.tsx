'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Configuration from '@/components/Configuration';
import Results from '@/components/Results';

export type AnalysisResults = {
  target_keywords: unknown[];
  competitor_data: { [key: string]: unknown[] };
  content_gaps: { [key: string]: unknown[] };
};

export type TreatmentCategory = {
  id: string;
  name: string;
  keywords: string[];
};

export type Settings = {
  target_domain: string;
  competitors: string[];
  treatment_categories: TreatmentCategory[];
  filter_keywords: boolean;
};

export default function Home() {
  const [settings, setSettings] = useState<Settings>({
    target_domain: 'cosmolaser.dk',
    competitors: [],
    treatment_categories: [],
    filter_keywords: true,
  });

  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setSettings(newSettings);
        return true;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    return false;
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const analysisResults = await response.json();
        setResults(analysisResults);
      } else {
        const errorData = await response.json();
        alert(`Analysis failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportResults = async () => {
    if (!results) return;

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'content_gap_analysis.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">
              Content Gap Analyzer for Cosmolaser.dk
            </h1>
            <p className="text-gray-600 mt-2">
              Analyser konkurrenters keywords og find content gaps
            </p>
          </div>

          <div className="p-6">
            <Dashboard
              settings={settings}
              onStartAnalysis={startAnalysis}
              onShowConfig={() => setShowConfig(true)}
              isAnalyzing={isAnalyzing}
            />

            {showConfig && (
              <Configuration
                settings={settings}
                onSave={saveSettings}
                onClose={() => setShowConfig(false)}
              />
            )}

            {results && (
              <Results
                results={results}
                onExport={exportResults}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
