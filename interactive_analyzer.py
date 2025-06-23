#!/usr/bin/env python3

from content_gap_analyzer import ContentGapAnalyzer

def show_main_menu():
    print("\n" + "="*60)
    print("    CONTENT GAP ANALYZER FOR COSMOLASER.DK")
    print("="*60)
    print("1.  👥 Administrer konkurrenter")
    print("2.  🎯 Administrer behandlingstyper (keyword filter)")
    print("3.  🌐 Administrer target domain")
    print("4.  ⚙️  Indstillinger")
    print("5.  🚀 Start content gap analyse")
    print("6.  📊 Vis status")
    print("7.  ❌ Exit")
    print("="*60)

def manage_competitors(analyzer):
    while True:
        print("\n" + "-"*40)
        print("    KONKURRENT ADMINISTRATION")
        print("-"*40)
        print("1. Vis nuværende konkurrenter")
        print("2. Tilføj konkurrent")
        print("3. Fjern konkurrent")
        print("4. Sæt ny konkurrentliste")
        print("5. Tilbage til hovedmenu")
        
        choice = input("\nVælg (1-5): ").strip()
        
        if choice == '1':
            analyzer.list_competitors()
            
        elif choice == '2':
            url = input("Indtast konkurrent URL (f.eks. example.com): ").strip()
            if url:
                analyzer.add_competitor(url)
            else:
                print("Ingen URL indtastet")
                
        elif choice == '3':
            analyzer.list_competitors()
            url = input("Indtast URL at fjerne: ").strip()
            if url:
                analyzer.remove_competitor(url)
            else:
                print("Ingen URL indtastet")
                
        elif choice == '4':
            print("Indtast konkurrent URLs (en per linje, tryk Enter på tom linje for at stoppe):")
            urls = []
            while True:
                url = input().strip()
                if not url:
                    break
                urls.append(url)
            if urls:
                analyzer.set_competitors(urls)
            else:
                print("Ingen URLs indtastet")
                
        elif choice == '5':
            break
            
        else:
            print("Ugyldigt valg. Prøv igen.")

def manage_treatment_keywords(analyzer):
    while True:
        print("\n" + "-"*40)
        print("    BEHANDLINGSTYPER ADMINISTRATION")
        print("-"*40)
        print("1. Vis nuværende behandlingstyper")
        print("2. Tilføj behandling/keyword")
        print("3. Fjern behandling/keyword")
        print("4. Vælg behandlingskategorier")
        print("5. Slå keyword filtrering til/fra")
        print("6. Tilbage til hovedmenu")
        
        choice = input("\nVælg (1-6): ").strip()
        
        if choice == '1':
            analyzer.list_treatment_keywords()
            
        elif choice == '2':
            keyword = input("Indtast behandling/keyword: ").strip()
            if keyword:
                analyzer.add_treatment_keyword(keyword)
            else:
                print("Intet keyword indtastet")
                
        elif choice == '3':
            analyzer.list_treatment_keywords()
            keyword = input("Indtast keyword at fjerne: ").strip()
            if keyword:
                analyzer.remove_treatment_keyword(keyword)
            else:
                print("Intet keyword indtastet")
                
        elif choice == '4':
            select_treatment_categories(analyzer)
            
        elif choice == '5':
            status = analyzer.toggle_keyword_filtering()
            print(f"Keyword filtrering er nu: {'ON' if status else 'OFF'}")
            
        elif choice == '6':
            break
            
        else:
            print("Ugyldigt valg. Prøv igen.")

def select_treatment_categories(analyzer):
    print("\n" + "-"*40)
    print("    VÆLG BEHANDLINGSKATEGORIER")
    print("-"*40)
    
    categories = {
        '1': ('Permanent hårfjerning', ['permanent hårfjerning', 'hårfjerning', 'laser hårfjerning', 'ipl hårfjerning', 'diode laser', 'alexandrite laser', 'epilering', 'hår fjernelse']),
        '2': ('Botox', ['botox', 'botulinum', 'rynkebehandling', 'panderynker', 'kragerødder', 'sveden']),
        '3': ('Filler', ['filler', 'hyaluronsyre', 'læbefiller', 'kindben', 'næsefiller', 'hageforstørrelse']),
        '4': ('Karsprængninger', ['karsprængninger', 'åreknuder', 'blodsprængninger', 'kapillarer', 'couperose', 'rosacea', 'blodkar', 'vaskulære læsioner']),
        '5': ('Pigmentforandringer', ['pigmentforandringer', 'pigmentpletter', 'aldersletter', 'solskader', 'melasma', 'hyperpigmentering', 'misfarvning', 'brune pletter']),
        '6': ('CO2 laser', ['co2 laser', 'fraktionel laser', 'hudfornyelse', 'laser resurfacing', 'ar behandling', 'porereduktion', 'hudstramning', 'laser peeling'])
    }
    
    for key, (name, keywords) in categories.items():
        print(f"{key}. {name} ({len(keywords)} keywords)")
    
    print("\nVælg kategorier (f.eks. 1,3,5 eller 'alle' for alle kategorier):")
    selection = input().strip()
    
    if selection.lower() == 'alle':
        # Add all keywords
        all_keywords = []
        for _, keywords in categories.values():
            all_keywords.extend(keywords)
        analyzer.set_treatment_keywords(all_keywords)
        print("Alle behandlingskategorier tilføjet")
    else:
        # Parse selection
        try:
            selected_numbers = [s.strip() for s in selection.split(',')]
            selected_keywords = []
            
            for num in selected_numbers:
                if num in categories:
                    _, keywords = categories[num]
                    selected_keywords.extend(keywords)
                    print(f"Tilføjet: {categories[num][0]}")
            
            if selected_keywords:
                analyzer.set_treatment_keywords(selected_keywords)
            else:
                print("Ingen gyldige kategorier valgt")
                
        except Exception as e:
            print(f"Fejl i selection: {e}")

def show_settings(analyzer):
    print("\n" + "-"*40)
    print("    INDSTILLINGER")
    print("-"*40)
    print("1. Slå keyword filtrering til/fra")
    print("2. Vis API status")
    print("3. Tilbage til hovedmenu")
    
    choice = input("\nVælg (1-3): ").strip()
    
    if choice == '1':
        status = analyzer.toggle_keyword_filtering()
        print(f"Keyword filtrering er nu: {'ON' if status else 'OFF'}")
    elif choice == '2':
        print("API credentials loaded fra .env fil")
        print(f"Target domain: {analyzer.target_domain}")
    elif choice == '3':
        return
    else:
        print("Ugyldigt valg")

def show_status(analyzer):
    print("\n" + "="*50)
    print("    NUVÆRENDE STATUS")
    print("="*50)
    print(f"🎯 Target domain: {analyzer.target_domain}")
    print(f"🔧 Keyword filtrering: {'ON' if analyzer.filter_keywords else 'OFF'}")
    print(f"👥 Antal konkurrenter: {len(analyzer.competitors)}")
    print(f"🎯 Antal treatment keywords: {len(analyzer.treatment_keywords)}")
    print(f"💾 Settings fil: {analyzer.settings_file}")
    
    print(f"\nKonkurrenter:")
    for i, comp in enumerate(analyzer.competitors, 1):
        print(f"  {i}. {comp}")
    
    if analyzer.filter_keywords:
        print(f"\nKeyword filtrering aktiv - {len(analyzer.treatment_keywords)} behandlingstermer")
    else:
        print("\nKeyword filtrering inaktiv - analyserer alle keywords")
    
    print(f"\n💾 Alle ændringer gemmes automatisk i {analyzer.settings_file}")

def manage_target_domain(analyzer):
    while True:
        print("\n" + "-"*40)
        print("    TARGET DOMAIN ADMINISTRATION")
        print("-"*40)
        print("1. Vis nuværende target domain")
        print("2. Ændre target domain")
        print("3. Tilbage til hovedmenu")
        
        choice = input("\nVælg (1-3): ").strip()
        
        if choice == '1':
            analyzer.list_target_domain()
            
        elif choice == '2':
            current_domain = analyzer.get_target_domain()
            print(f"Nuværende target domain: {current_domain}")
            new_domain = input("Indtast ny target domain (f.eks. example.com): ").strip()
            if new_domain:
                analyzer.set_target_domain(new_domain)
            else:
                print("Ingen domain indtastet")
                
        elif choice == '3':
            break
            
        else:
            print("Ugyldigt valg. Prøv igen.")

def main():
    analyzer = ContentGapAnalyzer()
    
    while True:
        show_main_menu()
        choice = input("\nVælg (1-7): ").strip()
        
        if choice == '1':
            manage_competitors(analyzer)
            
        elif choice == '2':
            manage_treatment_keywords(analyzer)
            
        elif choice == '3':
            manage_target_domain(analyzer)
            
        elif choice == '4':
            show_settings(analyzer)
            
        elif choice == '5':
            print("\n🚀 Starter content gap analyse...")
            try:
                results = analyzer.analyze_content_gap()
                filename = 'content_gap_analysis.xlsx'
                analyzer.export_to_excel(results, filename)
                print(f"\n✅ Analyse færdig! Check '{filename}' filen.")
            except Exception as e:
                print(f"❌ Fejl under analyse: {e}")
                
        elif choice == '6':
            show_status(analyzer)
            
        elif choice == '7':
            print("\n👋 Farvel!")
            break
            
        else:
            print("❌ Ugyldigt valg. Prøv igen.")

if __name__ == "__main__":
    main()