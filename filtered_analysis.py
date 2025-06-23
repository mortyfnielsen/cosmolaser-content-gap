#!/usr/bin/env python3

from content_gap_analyzer import ContentGapAnalyzer

def main():
    print("Content Gap Analysis med behandlingsfiltrering")
    print("=" * 50)
    
    print("Analyserer kun relevante behandlingstyper:")
    print("• Permanent hårfjerning")
    print("• Botox")
    print("• Filler") 
    print("• Karsprængninger")
    print("• Pigmentforandringer")
    print("• CO2 laser")
    print()
    
    # Opret analyzer med keyword filtrering aktiveret
    analyzer = ContentGapAnalyzer(filter_keywords=True)
    
    print("Starter filtreret analyse...")
    try:
        results = analyzer.analyze_content_gap()
        analyzer.export_to_excel(results, 'filtered_content_gap_analysis.xlsx')
        
        print("\nFiltreret analyse færdig!")
        print("Check 'filtered_content_gap_analysis.xlsx' for kun relevante behandlinger.")
        
    except Exception as e:
        print(f"Fejl under analyse: {e}")

if __name__ == "__main__":
    main()