import pandas as pd
import json
import os
from datetime import datetime
from dataforseo_client import DataForSEOClient
from config import Config

class ContentGapAnalyzer:
    def __init__(self, custom_competitors=None, filter_keywords=True):
        self.client = DataForSEOClient()
        self.target_domain = Config.TARGET_DOMAIN
        self.settings_file = 'settings.json'
        
        # Load saved settings if available
        self._load_settings()
        
        # Override with custom parameters if provided
        if custom_competitors is not None:
            self.competitors = custom_competitors
        if filter_keywords is not None:
            self.filter_keywords = filter_keywords
        
    def analyze_content_gap(self):
        """Main method to perform content gap analysis"""
        print(f"Analyzing content gap for {self.target_domain}")
        
        # Get target domain keywords
        target_keywords = self._get_domain_keywords(self.target_domain)
        
        # Get competitor keywords
        competitor_data = {}
        for competitor in self.competitors:
            competitor_data[competitor] = self._get_domain_keywords(competitor)
        
        # Find content gaps
        gaps = self._find_content_gaps(target_keywords, competitor_data)
        
        return {
            'target_keywords': target_keywords,
            'competitor_data': competitor_data,
            'content_gaps': gaps
        }
    
    def _get_domain_keywords(self, domain):
        """Get keywords for a specific domain"""
        try:
            response = self.client.get_domain_keywords(domain)
            if response.get('status_code') == 20000:
                if response.get('tasks') and response['tasks'][0].get('result'):
                    raw_data = response['tasks'][0]['result']
                    filtered_data = self._filter_keywords(raw_data)
                    
                    if self.filter_keywords and filtered_data:
                        total_filtered = sum(len(item.get('items', [])) for item in filtered_data)
                        total_original = sum(len(item.get('items', [])) for item in raw_data)
                        print(f"  {domain}: {total_filtered}/{total_original} relevante keywords")
                    
                    return filtered_data
                return []
            else:
                print(f"Error getting keywords for {domain}: {response.get('status_message')}")
                return []
        except Exception as e:
            print(f"Exception getting keywords for {domain}: {e}")
            return []
    
    def _find_content_gaps(self, target_keywords, competitor_data):
        """Identify keywords competitors rank for but target doesn't with detailed data"""
        target_kw_set = set()
        
        if target_keywords:
            for item in target_keywords:
                if item and item.get('items'):
                    for kw_item in item['items']:
                        if kw_item and kw_item.get('keyword_data', {}).get('keyword'):
                            target_kw_set.add(kw_item['keyword_data']['keyword'])

        gaps = {}
        
        for competitor, data in competitor_data.items():
            competitor_keywords = {}  # Store keyword with its data
            if data:
                for item in data:
                    if item and item.get('items'):
                        for kw_item in item['items']:
                            if kw_item and kw_item.get('keyword_data', {}).get('keyword'):
                                keyword = kw_item['keyword_data']['keyword']
                                keyword_info = kw_item.get('keyword_data', {}).get('keyword_info', {})
                                serp_element = kw_item.get('ranked_serp_element', {}).get('serp_item', {})
                                
                                competitor_keywords[keyword] = {
                                    'search_volume': keyword_info.get('search_volume', 0),
                                    'competition': keyword_info.get('competition', 0),
                                    'competition_level': keyword_info.get('competition_level', ''),
                                    'cpc': keyword_info.get('cpc', 0),
                                    'rank': serp_element.get('rank_absolute', 0),
                                    'url': serp_element.get('url', '')
                                }
            
            # Find keywords competitor has but target doesn't
            gap_keywords = []
            for keyword, data in competitor_keywords.items():
                if keyword not in target_kw_set:
                    gap_keywords.append({
                        'keyword': keyword,
                        'search_volume': data['search_volume'],
                        'competition': data['competition'],
                        'competition_level': data['competition_level'],
                        'cpc': data['cpc'],
                        'competitor_rank': data['rank'],
                        'competitor_url': data['url']
                    })
            
            gaps[competitor] = gap_keywords
        
        return gaps
    
    def _calculate_priority_score(self, search_volume, competition, cpc=0):
        """Calculate priority score based on search volume, competition and CPC"""
        # Handle None values by converting to 0
        search_volume = 0 if search_volume is None else search_volume
        competition = 0 if competition is None else competition
        cpc = 0 if cpc is None else cpc
        
        # Normalize search volume (higher = better)
        if search_volume == 0:
            volume_score = 0
        elif search_volume < 10:
            volume_score = 1
        elif search_volume < 50:
            volume_score = 2
        elif search_volume < 100:
            volume_score = 3
        elif search_volume < 500:
            volume_score = 4
        else:
            volume_score = 5
        
        # Normalize competition (lower = better)
        if competition == 0:
            comp_score = 5
        elif competition < 0.2:
            comp_score = 4
        elif competition < 0.4:
            comp_score = 3
        elif competition < 0.6:
            comp_score = 2
        elif competition < 0.8:
            comp_score = 1
        else:
            comp_score = 0
        
        # CPC bonus (higher CPC often indicates commercial value)
        cpc_bonus = min(cpc / 10, 1)  # Max 1 point bonus for CPC >= 10
        
        # Calculate final score (0-10 scale)
        priority_score = (volume_score * 0.5) + (comp_score * 0.4) + (cpc_bonus * 0.1)
        
        # Determine priority level
        if priority_score >= 4:
            priority_level = 'HØJ'
        elif priority_score >= 2.5:
            priority_level = 'MEDIUM'
        else:
            priority_level = 'LAV'
        
        return round(priority_score or 0, 2), priority_level
    
    def export_to_excel(self, results, filename='content_gap_analysis.xlsx'):
        """Export results to Excel file"""
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # Export target keywords
            if results['target_keywords']:
                target_df = self._keywords_to_dataframe(results['target_keywords'], 'Target')
                if not target_df.empty:
                    target_df.to_excel(writer, sheet_name='Target_Keywords', index=False)
            
            # Export competitor keywords
            for competitor, data in results['competitor_data'].items():
                if data:
                    comp_df = self._keywords_to_dataframe(data, competitor)
                    if not comp_df.empty:
                        sheet_name = competitor.replace('.', '_').replace('[', '').replace(']', '').replace('*', '').replace('?', '').replace(':', '').replace('/', '\\')[:31]
                        comp_df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            # Export content gaps with detailed information
            gaps_data = []
            for competitor, gap_keywords in results['content_gaps'].items():
                for gap_item in gap_keywords:
                    if isinstance(gap_item, dict):  # New detailed format
                        priority_score, priority_level = self._calculate_priority_score(
                            gap_item.get('search_volume', 0),
                            gap_item.get('competition', 0),
                            gap_item.get('cpc', 0)
                        )
                        
                        gaps_data.append({
                            'Competitor': competitor,
                            'Missing_Keyword': gap_item.get('keyword', ''),
                            'Search_Volume': gap_item.get('search_volume', 0),
                            'Competition': round(gap_item.get('competition', 0) or 0, 3),
                            'Competition_Level': gap_item.get('competition_level', ''),
                            'CPC': round(gap_item.get('cpc', 0) or 0, 2),
                            'Priority_Score': priority_score,
                            'Priority_Level': priority_level,
                            'Competitor_Rank': gap_item.get('competitor_rank', ''),
                            'Competitor_URL': gap_item.get('competitor_url', '')
                        })
                    else:  # Old simple format (backward compatibility)
                        gaps_data.append({
                            'Competitor': competitor,
                            'Missing_Keyword': gap_item,
                            'Search_Volume': 0,
                            'Competition': 0,
                            'Competition_Level': '',
                            'CPC': 0,
                            'Priority_Score': 0,
                            'Priority_Level': 'UNKNOWN',
                            'Competitor_Rank': '',
                            'Competitor_URL': ''
                        })
            
            if gaps_data:
                gaps_df = pd.DataFrame(gaps_data)
                # Sort by priority score (highest first)
                gaps_df = gaps_df.sort_values(['Priority_Score', 'Search_Volume'], ascending=[False, False])
                if not gaps_df.empty:
                    gaps_df.to_excel(writer, sheet_name='Content_Gaps', index=False)
        
        print(f"Results exported to {filename}")
    
    def _keywords_to_dataframe(self, keyword_data, source):
        """Convert keyword data to pandas DataFrame"""
        rows = []
        if keyword_data:
            for item in keyword_data:
                if item and item.get('items'):
                    for kw_item in item['items']:
                        if not kw_item:
                            continue
                        
                        # Extract keyword from nested structure
                        keyword = kw_item.get('keyword_data', {}).get('keyword', '')
                        keyword_info = kw_item.get('keyword_data', {}).get('keyword_info', {})
                        serp_element = kw_item.get('ranked_serp_element', {}).get('serp_item', {})
                        
                        rows.append({
                            'Source': source,
                            'Keyword': keyword,
                            'Rank': serp_element.get('rank_absolute'),
                            'URL': serp_element.get('url'),
                            'Title': serp_element.get('title'),
                            'Search_Volume': keyword_info.get('search_volume', 0),
                            'Competition': keyword_info.get('competition', 0),
                            'CPC': keyword_info.get('cpc', 0),
                            'Competition_Level': keyword_info.get('competition_level', '')
                        })
        
        return pd.DataFrame(rows)
    
    def _is_relevant_keyword(self, keyword):
        """Check if keyword is relevant to cosmetic treatments"""
        if not self.filter_keywords:
            return True
            
        keyword_lower = keyword.lower()
        return any(treatment.lower() in keyword_lower for treatment in self.treatment_keywords)
    
    def _filter_keywords(self, keyword_data):
        """Filter keywords to only include relevant treatments"""
        if not self.filter_keywords or not keyword_data:
            return keyword_data
            
        filtered_data = []
        for item in keyword_data:
            if item and item.get('items'):
                filtered_items = []
                for kw_item in item['items']:
                    if kw_item and kw_item.get('keyword_data', {}).get('keyword'):
                        keyword = kw_item['keyword_data']['keyword']
                        if self._is_relevant_keyword(keyword):
                            filtered_items.append(kw_item)
                
                if filtered_items:
                    filtered_item = item.copy()
                    filtered_item['items'] = filtered_items
                    filtered_item['items_count'] = len(filtered_items)
                    filtered_data.append(filtered_item)
        
        return filtered_data
    
    def add_competitor(self, competitor_url):
        """Add a new competitor URL to the analysis"""
        if competitor_url not in self.competitors:
            self.competitors.append(competitor_url)
            print(f"Added competitor: {competitor_url}")
            self._save_settings()
        else:
            print(f"Competitor {competitor_url} already exists")
    
    def remove_competitor(self, competitor_url):
        """Remove a competitor URL from the analysis"""
        if competitor_url in self.competitors:
            self.competitors.remove(competitor_url)
            print(f"Removed competitor: {competitor_url}")
            self._save_settings()
        else:
            print(f"Competitor {competitor_url} not found")
    
    def list_competitors(self):
        """List all current competitors"""
        print("Current competitors:")
        for i, competitor in enumerate(self.competitors, 1):
            print(f"{i}. {competitor}")
        return self.competitors
    
    def set_competitors(self, competitor_urls):
        """Set a new list of competitor URLs"""
        self.competitors = competitor_urls if isinstance(competitor_urls, list) else [competitor_urls]
        print(f"Updated competitors list: {self.competitors}")
        self._save_settings()
    
    def add_treatment_keyword(self, keyword):
        """Add a new treatment keyword to filter"""
        if keyword not in self.treatment_keywords:
            self.treatment_keywords.append(keyword)
            print(f"Added treatment keyword: {keyword}")
            self._save_settings()
        else:
            print(f"Treatment keyword '{keyword}' already exists")
    
    def remove_treatment_keyword(self, keyword):
        """Remove a treatment keyword from filter"""
        if keyword in self.treatment_keywords:
            self.treatment_keywords.remove(keyword)
            print(f"Removed treatment keyword: {keyword}")
            self._save_settings()
        else:
            print(f"Treatment keyword '{keyword}' not found")
    
    def list_treatment_keywords(self):
        """List all current treatment keywords grouped by category"""
        print("Current treatment keywords:")
        
        # Group keywords by category
        categories = {
            'Permanent hårfjerning': ['permanent hårfjerning', 'hårfjerning', 'laser hårfjerning', 'ipl hårfjerning', 'diode laser', 'alexandrite laser', 'epilering', 'hår fjernelse'],
            'Botox': ['botox', 'botulinum', 'rynkebehandling', 'panderynker', 'kragerødder', 'sveden'],
            'Filler': ['filler', 'hyaluronsyre', 'læbefiller', 'kindben', 'næsefiller', 'hageforstørrelse'],
            'Karsprængninger': ['karsprængninger', 'åreknuder', 'blodsprængninger', 'kapillarer', 'couperose', 'rosacea', 'blodkar', 'vaskulære læsioner'],
            'Pigmentforandringer': ['pigmentforandringer', 'pigmentpletter', 'aldersletter', 'solskader', 'melasma', 'hyperpigmentering', 'misfarvning', 'brune pletter'],
            'CO2 laser': ['co2 laser', 'fraktionel laser', 'hudfornyelse', 'laser resurfacing', 'ar behandling', 'porereduktion', 'hudstramning', 'laser peeling']
        }
        
        for category, keywords in categories.items():
            active_keywords = [kw for kw in keywords if kw in self.treatment_keywords]
            if active_keywords:
                print(f"\n{category}:")
                for kw in active_keywords:
                    print(f"  • {kw}")
        
        # Show any custom keywords not in predefined categories
        all_predefined = []
        for keywords in categories.values():
            all_predefined.extend(keywords)
        
        custom_keywords = [kw for kw in self.treatment_keywords if kw not in all_predefined]
        if custom_keywords:
            print(f"\nCustom keywords:")
            for kw in custom_keywords:
                print(f"  • {kw}")
        
        return self.treatment_keywords
    
    def set_treatment_keywords(self, keywords):
        """Set a new list of treatment keywords"""
        self.treatment_keywords = keywords if isinstance(keywords, list) else [keywords]
        print(f"Updated treatment keywords: {len(self.treatment_keywords)} keywords")
        self._save_settings()
    
    def toggle_keyword_filtering(self):
        """Toggle keyword filtering on/off"""
        self.filter_keywords = not self.filter_keywords
        status = "aktiveret" if self.filter_keywords else "deaktiveret"
        print(f"Keyword filtrering {status}")
        self._save_settings()
        return self.filter_keywords
    
    def _load_settings(self):
        """Load settings from JSON file"""
        try:
            if os.path.exists(self.settings_file):
                with open(self.settings_file, 'r', encoding='utf-8') as f:
                    settings = json.load(f)
                
                self.competitors = settings.get('competitors', Config.COMPETITOR_DOMAINS)
                self.treatment_keywords = settings.get('treatment_keywords', Config.TREATMENT_KEYWORDS)
                self.filter_keywords = settings.get('filter_keywords', True)
                self.target_domain = settings.get('target_domain', Config.TARGET_DOMAIN)
                
                print(f"Indstillinger indlæst: {len(self.competitors)} konkurrenter, {len(self.treatment_keywords)} keywords")
            else:
                # Use default settings
                self.competitors = Config.COMPETITOR_DOMAINS.copy()
                self.treatment_keywords = Config.TREATMENT_KEYWORDS.copy()
                self.filter_keywords = True
                self.target_domain = Config.TARGET_DOMAIN
                print("Bruger standard indstillinger")
                
        except Exception as e:
            print(f"Fejl ved indlæsning af indstillinger: {e}")
            # Fallback to defaults
            self.competitors = Config.COMPETITOR_DOMAINS.copy()
            self.treatment_keywords = Config.TREATMENT_KEYWORDS.copy()
            self.filter_keywords = True
            self.target_domain = Config.TARGET_DOMAIN
    
    def _save_settings(self):
        """Save current settings to JSON file"""
        try:
            settings = {
                'competitors': self.competitors,
                'treatment_keywords': self.treatment_keywords,
                'filter_keywords': self.filter_keywords,
                'target_domain': self.target_domain,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            with open(self.settings_file, 'w', encoding='utf-8') as f:
                json.dump(settings, f, indent=2, ensure_ascii=False)
            
            print("Indstillinger gemt")
            
        except Exception as e:
            print(f"Fejl ved gemning af indstillinger: {e}")
    
    def save_current_settings(self):
        """Manually save current settings"""
        self._save_settings()

    def get_target_domain(self):
        """Get current target domain"""
        return self.target_domain
    
    def set_target_domain(self, domain):
        """Set a new target domain for analysis"""
        if domain and domain.strip():
            self.target_domain = domain.strip()
            print(f"Target domain ændret til: {self.target_domain}")
            self._save_settings()
        else:
            print("Ugyldig domain - skal ikke være tom")
    
    def list_target_domain(self):
        """Display current target domain"""
        print(f"Nuværende target domain: {self.target_domain}")
        return self.target_domain