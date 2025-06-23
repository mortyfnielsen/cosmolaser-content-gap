import requests
import json
from config import Config

class DataForSEOClient:
    def __init__(self):
        self.login = Config.DATAFORSEO_LOGIN
        self.password = Config.DATAFORSEO_PASSWORD
        self.base_url = Config.BASE_URL
        
    def _make_request(self, endpoint, data=None):
        url = f"{self.base_url}/{endpoint}"
        
        if data:
            response = requests.post(
                url,
                auth=(self.login, self.password),
                headers={'Content-Type': 'application/json'},
                data=json.dumps(data)
            )
        else:
            response = requests.get(
                url,
                auth=(self.login, self.password)
            )
        
        return response.json()
    
    def get_domain_keywords(self, domain, limit=1000):
        """Get organic keywords for a domain"""
        data = [{
            "target": domain,
            "location_code": Config.LOCATION_CODE,
            "language_code": Config.LANGUAGE_CODE,
            "limit": limit
        }]
        
        return self._make_request("dataforseo_labs/google/ranked_keywords/live", data)
    
    def get_competitors_keywords(self, domain):
        """Get competitor keywords analysis"""
        data = [{
            "target": domain,
            "location_code": Config.LOCATION_CODE,
            "language_code": Config.LANGUAGE_CODE,
            "limit": 1000
        }]
        
        return self._make_request("dataforseo_labs/google/competitors_domain/live", data)
    
    def get_keyword_ideas(self, keywords, limit=1000):
        """Get keyword ideas for seed keywords"""
        data = [{
            "keywords": keywords if isinstance(keywords, list) else [keywords],
            "location_code": Config.LOCATION_CODE,
            "language_code": Config.LANGUAGE_CODE,
            "limit": limit
        }]
        
        return self._make_request("dataforseo_labs/google/keyword_ideas/live", data)