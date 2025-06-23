import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DATAFORSEO_LOGIN = os.getenv('DATAFORSEO_LOGIN')
    DATAFORSEO_PASSWORD = os.getenv('DATAFORSEO_PASSWORD')
    TARGET_DOMAIN = os.getenv('TARGET_DOMAIN', 'cosmolaser.dk')
    
    # DataForSEO API endpoints
    BASE_URL = 'https://api.dataforseo.com/v3'
    
    # Analysis settings
    LOCATION_CODE = 2208  # Denmark
    LANGUAGE_CODE = 'da'  # Danish
    
    # Competitor domains for comparison - laser/kosmetiske behandlingsklinikker
    COMPETITOR_DOMAINS = [
        'laserklinik.dk',
        'klinikken.dk',
        'epilationsklinikken.dk',
        'dentalelaser.dk',
        'beautylaser.dk',
        'laserbehandling.dk'
    ]
    
    # Relevante behandlingstyper for filtrering
    TREATMENT_KEYWORDS = [
        # Permanent hårfjerning
        'permanent hårfjerning', 'hårfjerning', 'laser hårfjerning', 'ipl hårfjerning', 'diode laser',
        'alexandrite laser', 'epilering', 'hår fjernelse',
        
        # Botox
        'botox', 'botulinum', 'rynkebehandling', 'panderynker', 'kragerødder', 'sveden',
        
        # Filler
        'filler', 'hyaluronsyre', 'læbefiller', 'kindben', 'næsefiller', 'hageforstørrelse',
        
        # Karsprængninger
        'karsprængninger', 'åreknuder', 'blodsprængninger', 'kapillarer', 'couperose',
        'rosacea', 'blodkar', 'vaskulære læsioner',
        
        # Pigmentforandringer
        'pigmentforandringer', 'pigmentpletter', 'aldersletter', 'solskader', 'melasma',
        'hyperpigmentering', 'misfarvning', 'brune pletter',
        
        # CO2 laser
        'co2 laser', 'fraktionel laser', 'hudfornyelse', 'laser resurfacing', 'ar behandling',
        'porereduktion', 'hudstramning', 'laser peeling'
    ]