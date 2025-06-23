#!/usr/bin/env python3

from content_gap_analyzer import ContentGapAnalyzer
import json

def inspect_data():
    analyzer = ContentGapAnalyzer()
    
    target_keywords = analyzer._get_domain_keywords("cosmolaser.dk")
    
    if target_keywords and target_keywords[0].get('items'):
        items = target_keywords[0]['items']
        print("First keyword item structure:")
        print(json.dumps(items[0], indent=2))
        print(f"\nKeys in first item: {list(items[0].keys())}")

if __name__ == "__main__":
    inspect_data()