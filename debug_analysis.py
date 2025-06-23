#!/usr/bin/env python3

from content_gap_analyzer import ContentGapAnalyzer
import json

def debug_analysis():
    analyzer = ContentGapAnalyzer()
    
    print("Starting debug analysis...")
    
    # Test one domain first
    print("\nTesting cosmolaser.dk keywords:")
    target_keywords = analyzer._get_domain_keywords("cosmolaser.dk")
    print(f"Raw response type: {type(target_keywords)}")
    print(f"Raw response length: {len(target_keywords) if target_keywords else 0}")
    
    if target_keywords:
        print("First few items:")
        for i, item in enumerate(target_keywords[:2]):
            print(f"Item {i}: {type(item)}")
            print(f"Keys: {item.keys() if isinstance(item, dict) else 'Not a dict'}")
            if isinstance(item, dict):
                print(f"Content preview: {str(item)[:200]}...")
    else:
        print("No target keywords returned")
    
    # Test competitor
    print("\nTesting competitor laserklinik.dk:")
    comp_keywords = analyzer._get_domain_keywords("laserklinik.dk")
    print(f"Competitor response type: {type(comp_keywords)}")
    print(f"Competitor response length: {len(comp_keywords) if comp_keywords else 0}")
    
    if comp_keywords:
        print("First competitor item:")
        item = comp_keywords[0]
        print(f"Keys: {item.keys() if isinstance(item, dict) else 'Not a dict'}")
        if isinstance(item, dict):
            print(f"Content preview: {str(item)[:200]}...")

if __name__ == "__main__":
    debug_analysis()