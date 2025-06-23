#!/usr/bin/env python3

from content_gap_analyzer import ContentGapAnalyzer

def main():
    analyzer = ContentGapAnalyzer()
    
    print("Starting content gap analysis for cosmolaser.dk...")
    
    try:
        results = analyzer.analyze_content_gap()
        analyzer.export_to_excel(results)
        
        print("\nAnalysis completed successfully!")
        print("Check the 'content_gap_analysis.xlsx' file for detailed results.")
        
    except Exception as e:
        print(f"Error during analysis: {e}")

if __name__ == "__main__":
    main()