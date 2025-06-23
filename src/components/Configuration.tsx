import { useState } from 'react';
import { Settings, TreatmentCategory } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from "@/components/ui/badge";
import { Trash2, PlusCircle } from 'lucide-react';

interface ConfigurationProps {
  settings: Settings;
  onSave: (settings: Settings) => Promise<boolean>;
  onClose: () => void;
}

export default function Configuration({ settings, onSave, onClose }: ConfigurationProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newKeywords, setNewKeywords] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(localSettings);
    setIsSaving(false);
    if (success) {
      onClose();
    } else {
      alert('Fejl ved gemning af indstillinger');
    }
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && !localSettings.competitors.includes(newCompetitor.trim())) {
      setLocalSettings(prev => ({ ...prev, competitors: [...prev.competitors, newCompetitor.trim()] }));
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (competitor: string) => {
    setLocalSettings(prev => ({ ...prev, competitors: prev.competitors.filter(c => c !== competitor) }));
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: TreatmentCategory = {
        id: new Date().getTime().toString(),
        name: newCategoryName.trim(),
        keywords: [],
      };
      setLocalSettings(prev => ({ ...prev, treatment_categories: [...prev.treatment_categories, newCategory] }));
      setNewCategoryName('');
    }
  };

  const removeCategory = (categoryId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      treatment_categories: prev.treatment_categories.filter(c => c.id !== categoryId),
    }));
  };

  const addKeywordToCategory = (categoryId: string) => {
    const keyword = newKeywords[categoryId]?.trim();
    if (!keyword) return;

    setLocalSettings(prev => ({
      ...prev,
      treatment_categories: prev.treatment_categories.map(c => {
        if (c.id === categoryId && !c.keywords.includes(keyword)) {
          return { ...c, keywords: [...c.keywords, keyword] };
        }
        return c;
      }),
    }));

    setNewKeywords(prev => ({ ...prev, [categoryId]: '' }));
  };

  const removeKeywordFromCategory = (categoryId: string, keyword: string) => {
    setLocalSettings(prev => ({
      ...prev,
      treatment_categories: prev.treatment_categories.map(c => {
        if (c.id === categoryId) {
          return { ...c, keywords: c.keywords.filter(k => k !== keyword) };
        }
        return c;
      }),
    }));
  };
  
  const totalKeywords = localSettings.treatment_categories.reduce((acc, cat) => acc + cat.keywords.length, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader>
          <CardTitle>⚙️ Indstillinger</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto space-y-6">
          
          {/* Target Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Target Domain</label>
            <Input
              type="text"
              value={localSettings.target_domain}
              onChange={(e) => setLocalSettings({ ...localSettings, target_domain: e.target.value })}
              placeholder="f.eks. cosmolaser.dk"
            />
          </div>

          {/* Competitors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">👥 Konkurrenter ({localSettings.competitors.length})</label>
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                placeholder="Tilføj konkurrent (f.eks. example.com)"
              />
              <Button onClick={addCompetitor}>Tilføj</Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto rounded-md border p-2">
              {localSettings.competitors.map((competitor) => (
                <Badge key={competitor} variant="secondary" className="mr-2 mb-2 text-sm">
                  {competitor}
                  <button onClick={() => removeCompetitor(competitor)} className="ml-2 text-red-500 hover:text-red-700">
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Treatment Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                🎯 Behandlingstyper ({totalKeywords} keywords)
              </label>
               <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.filter_keywords}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    filter_keywords: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Aktiver keyword filtrering</span>
              </label>
            </div>

            <Accordion type="multiple" className="w-full">
              {localSettings.treatment_categories.map(category => (
                <AccordionItem value={category.id} key={category.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full">
                      <span>{category.name} <Badge variant="outline" className="ml-2">{category.keywords.length}</Badge></span>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeCategory(category.id); }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newKeywords[category.id] || ''}
                        onChange={(e) => setNewKeywords({ ...newKeywords, [category.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addKeywordToCategory(category.id)}
                        placeholder="Tilføj keyword"
                      />
                      <Button onClick={() => addKeywordToCategory(category.id)}>Tilføj</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.keywords.map(keyword => (
                        <Badge key={keyword}>
                          {keyword}
                          <button onClick={() => removeKeywordFromCategory(category.id, keyword)} className="ml-2">
                            &times;
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="flex gap-2 mt-4">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                placeholder="Ny kategori navn"
              />
              <Button onClick={addCategory} variant="outline">
                <PlusCircle className="h-4 w-4 mr-2"/>
                Tilføj Kategori
              </Button>
            </div>
          </div>
        </CardContent>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Annuller</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Gemmer...' : 'Gem Indstillinger'}
          </Button>
        </div>
      </Card>
    </div>
  );
}