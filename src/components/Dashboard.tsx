import { Settings } from '@/app/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Settings as SettingsIcon, Rocket, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  settings: Settings;
  onStartAnalysis: () => void;
  onShowConfig: () => void;
  isAnalyzing: boolean;
}

export default function Dashboard({
  settings,
  onStartAnalysis,
  onShowConfig,
  isAnalyzing,
}: DashboardProps) {
  const totalKeywords = settings.treatment_categories?.reduce((acc, cat) => acc + cat.keywords.length, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="mr-2" />
            Nuværende Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="text-sm text-gray-600">Target Domain</CardHeader>
              <CardContent className="text-lg font-semibold text-gray-900">
                {settings.target_domain}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-sm text-gray-600">Konkurrenter</CardHeader>
              <CardContent className="text-lg font-semibold text-gray-900">
                {settings.competitors.length}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-sm text-gray-600">Behandlingstyper</CardHeader>
              <CardContent className="text-lg font-semibold text-gray-900">
                {settings.treatment_categories?.length || 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-sm text-gray-600">Keywords I Alt</CardHeader>
              <CardContent className="text-lg font-semibold text-gray-900">
                {totalKeywords}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onStartAnalysis}
          disabled={isAnalyzing || settings.competitors.length === 0}
          size="lg"
          className="flex-1"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyserer...
            </span>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Start Content Gap Analyse
            </>
          )}
        </Button>

        <Button onClick={onShowConfig} size="lg" variant="outline">
          <SettingsIcon className="mr-2 h-5 w-5" />
          Indstillinger
        </Button>
      </div>

      {/* Warning if no competitors */}
      {settings.competitors.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center">
             <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Ingen konkurrenter konfigureret
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Du skal tilføje mindst én konkurrent for at kunne starte analysen.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}