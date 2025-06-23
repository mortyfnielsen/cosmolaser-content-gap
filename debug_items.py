#!/usr/bin/env python3

from content_gap_analyzer import ContentGapAnalyzer

def debug_items():
    analyzer = ContentGapAnalyzer()
    
    print("Getting keywords for cosmolaser.dk...")
    target_keywords = analyzer._get_domain_keywords("cosmolaser.dk")
    
    if target_keywords and target_keywords[0].get('items'):
        items = target_keywords[0]['items']
        print(f"Found {len(items)} keywords")
        print("First 3 keywords:")
        for i, kw_item in enumerate(items[:3]):
            keyword = kw_item.get('keyword_data', {}).get('keyword', 'NO KEYWORD')
            rank = kw_item.get('ranked_serp_element', {}).get('serp_item', {}).get('rank_absolute', 'NO RANK')
            print(f"  {i+1}. {keyword} - Rank: {rank}")
    else:
        print("No items found")

if __name__ == "__main__":
    debug_items()