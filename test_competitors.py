#!/usr/bin/env python3

from content_gap_analyzer import ContentGapAnalyzer

def test_competitor_management():
    analyzer = ContentGapAnalyzer()
    
    print("Original competitors:")
    analyzer.list_competitors()
    
    print("\nAdding new competitor:")
    analyzer.add_competitor("laserbehandling.dk")
    
    print("\nUpdated competitors:")
    analyzer.list_competitors()
    
    print("\nRemoving a competitor:")
    analyzer.remove_competitor("plastikkirurgi.dk")
    
    print("\nFinal competitors:")
    analyzer.list_competitors()

if __name__ == "__main__":
    test_competitor_management()