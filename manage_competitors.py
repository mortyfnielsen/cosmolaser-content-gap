#!/usr/bin/env python3

from content_gap_analyzer import ContentGapAnalyzer

def manage_competitors():
    analyzer = ContentGapAnalyzer()
    
    print("Nuværende konkurrenter:")
    analyzer.list_competitors()
    
    print("\nForeslåede laser/kosmetiske behandlingsklinikker:")
    suggested = [
        'epilationsklinikken.dk',
        'beautylaser.dk', 
        'laserbehandling.dk',
        'dentalelaser.dk',
        'laserplus.dk',
        'aestheticslaser.dk'
    ]
    
    for i, comp in enumerate(suggested, 1):
        print(f"{i}. {comp}")
    
    print("\nVil du:")
    print("1. Tilføj specifik konkurrent")
    print("2. Erstat med relevante laser-konkurrenter") 
    print("3. Fortsæt med nuværende liste")
    
    choice = input("\nVælg (1-3): ").strip()
    
    if choice == '1':
        comp = input("Indtast konkurrent URL: ").strip()
        if comp:
            analyzer.add_competitor(comp)
    
    elif choice == '2':
        laser_competitors = [
            'laserklinik.dk',
            'epilationsklinikken.dk', 
            'beautylaser.dk',
            'laserbehandling.dk'
        ]
        analyzer.set_competitors(laser_competitors)
        print("Opdateret til laser-relevante konkurrenter")
    
    print("\nFinal konkurrentliste:")
    analyzer.list_competitors()
    
    return analyzer

if __name__ == "__main__":
    analyzer = manage_competitors()
    
    run_analysis = input("\nKør analyse nu? (y/n): ").strip().lower()
    if run_analysis in ['y', 'yes', 'ja']:
        print("Starter analyse...")
        results = analyzer.analyze_content_gap()
        analyzer.export_to_excel(results)
        print("Analyse færdig!")