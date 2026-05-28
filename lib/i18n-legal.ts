import type { LangKey } from './i18n'

export interface LegalItem { lb: string; tx: string }
export interface ThirdPartyItem { nm: string; dc: string; url: string }
export interface BoldItem { pre: string; bold: string; post: string }

export interface PrivacyT {
  title: string; updated: string
  op: { h: string; p: string }
  data: { h: string; items: LegalItem[] }
  purpose: { h: string; items: string[] }
  third: { h: string; items: ThirdPartyItem[] }
  cookies: { h: string; p: string }
  rights: { h: string; p: string }
  security: { h: string; p: string }
  contact: { h: string; p: string }
}

export interface TermsT {
  title: string; updated: string
  op: { h: string; p: string }
  service: { h: string; p: string }
  account: { h: string; items: string[] }
  usage: { h: string; intro: string; items: string[] }
  liability: { h: string; p: string }
  avail: { h: string; p: string }
  changes: { h: string; p: string }
  law: { h: string; p: string }
  contact: { h: string; p: string }
  lnks: { privacy: string; disclaimer: string; back: string }
}

export interface DisclaimerT {
  title: string; updated: string; warn: string
  what: { h: string; p: string }
  whatnot: { h: string; items: BoldItem[] }
  liability: { h: string; p1: string; p2: string }
  rec: { h: string; intro: string; items: string[] }
  law: { h: string; p: string }
  contact: { h: string; p: string }
  lnks: { privacy: string; back: string }
}

export interface LegalT { privacy: PrivacyT; terms: TermsT; disclaimer: DisclaimerT }

const legalTranslations: Partial<Record<string, LegalT>> = {
  cs: {
    privacy: {
      title: 'Ochrana osobních údajů', updated: 'Poslední aktualizace: 11. 5. 2025',
      op: { h: '1. Provozovatel', p: 'DocThink je provozován jako individuální projekt. Kontakt: info@docthink.app' },
      data: {
        h: '2. Jaké údaje zpracováváme',
        items: [
          { lb: 'Přihlašovací údaje', tx: 'e-mail a heslo pro vytvoření účtu (spravuje Clerk, Inc.)' },
          { lb: 'Dokumenty a fotografie', tx: 'soubory které nahraješ za účelem analýzy. Nejsou trvale ukládány — jsou odeslány AI modelu a po analýze zahozeny.' },
          { lb: 'Platební údaje', tx: 'zpracovává výhradně Stripe, Inc. My nemáme přístup k číslu karty.' },
          { lb: 'Počet kreditů', tx: 'ukládáme pouze počet zbývajících analýz na tvém účtu.' },
        ],
      },
      purpose: { h: '3. Účel zpracování', items: ['Poskytnutí služby analýzy smluv a dokumentů pomocí AI', 'Správa uživatelského účtu a kreditů', 'Zpracování plateb za prémiové kredity'] },
      third: {
        h: '4. Třetí strany',
        items: [
          { nm: 'Clerk', dc: 'autentizace', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'AI analýza dokumentů', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'platby', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'ukládání počtu kreditů', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookies', p: 'Používáme pouze technické cookies nezbytné pro přihlášení a provoz aplikace. Nepoužíváme reklamní ani sledovací cookies.' },
      rights: { h: '6. Tvá práva', p: 'Máš právo na přístup ke svým údajům, jejich opravu nebo smazání. Žádost pošli na info@docthink.app. Účet lze smazat přímo v aplikaci.' },
      security: { h: '7. Bezpečnost', p: 'Veškerá komunikace je šifrována přes HTTPS. Dokumenty nejsou dlouhodobě ukládány na serverech.' },
      contact: { h: '8. Kontakt', p: 'Otázky k ochraně dat: info@docthink.app' },
    },
    terms: {
      title: 'Podmínky použití', updated: 'Poslední aktualizace: 26. 5. 2025',
      op: { h: '1. Provozovatel', p: 'Službu DocThink provozuje individuální projekt. Kontakt: info@docthink.app. Používáním služby souhlasíte s těmito podmínkami.' },
      service: { h: '2. Popis služby', p: 'DocThink je AI nástroj pro analýzu smluv a dokumentů. Služba identifikuje rizikové klauzule, chybějící ustanovení a generuje doporučení. Výstupy mají výhradně informativní charakter a nepředstavují právní poradenství.' },
      account: {
        h: '3. Uživatelský účet a kredity',
        items: [
          'Registrace je bezplatná. Nový účet obdrží počáteční kredity pro testování služby.',
          'Každá analýza dokumentu odečte 1 kredit z vašeho zůstatku.',
          'Kredity lze zakoupit přes platební bránu Stripe. Platby jsou nevratné, pokud není dohodnuto jinak.',
          'Zakoupené kredity nemají dobu platnosti.',
          'Nevyužité kredity nejsou při zrušení účtu propláceny.',
        ],
      },
      usage: {
        h: '4. Povolené použití', intro: 'Zavazujete se, že nebudete:',
        items: [
          'Nahrávat obsah porušující autorská práva nebo práva třetích stran.',
          'Zneužívat službu k automatizovanému hromadnému zpracování bez souhlasu provozovatele.',
          'Pokoušet se obejít bezpečnostní mechanismy nebo omezení služby.',
          'Sdílet přístupové údaje k účtu s třetími osobami.',
        ],
      },
      liability: { h: '5. Omezení odpovědnosti', p: 'DocThink je poskytován „tak jak je" bez záruky přesnosti, úplnosti nebo vhodnosti pro konkrétní účel. Provozovatel nenese odpovědnost za jakékoli škody vzniklé v důsledku spoléhání se na výstupy AI analýzy. Uživatel nese plnou odpovědnost za svá rozhodnutí.' },
      avail: { h: '6. Dostupnost služby', p: 'Provozovatel se snaží zajistit nepřetržitý provoz, ale nevylučuje výpadky z důvodu údržby nebo technických problémů. Provozovatel si vyhrazuje právo kdykoli pozastavit nebo ukončit poskytování služby.' },
      changes: { h: '7. Změny podmínek', p: 'Provozovatel si vyhrazuje právo podmínky kdykoli změnit. O podstatných změnách budou registrovaní uživatelé informováni emailem. Další používání služby po změně podmínek znamená souhlas s novými podmínkami.' },
      law: { h: '8. Rozhodné právo', p: 'Tyto podmínky se řídí právním řádem České republiky. Případné spory budou řešeny před příslušnými soudy České republiky.' },
      contact: { h: '9. Kontakt', p: 'Dotazy k podmínkám: info@docthink.app' },
      lnks: { privacy: 'Ochrana osobních údajů', disclaimer: 'Právní upozornění', back: '← Zpět do aplikace' },
    },
    disclaimer: {
      title: 'Právní upozornění', updated: 'Poslední aktualizace: 26. 5. 2025',
      warn: 'DocThink není právní poradce. Výstupy aplikace mají pouze informativní charakter a nenahrazují odbornou právní pomoc.',
      what: { h: '1. Co DocThink dělá', p: 'DocThink je nástroj využívající umělou inteligenci (AI) k automatické analýze smluvních dokumentů. Aplikace identifikuje potenciálně rizikové formulace, chybějící ujednání a doporučuje verdikt (podepsat / upravit / odmítnout) na základě obsahu nahraného dokumentu.' },
      whatnot: {
        h: '2. Co DocThink NENÍ',
        items: [
          { pre: 'DocThink ', bold: 'není advokát, právník ani právní poradce', post: '.' },
          { pre: 'Analýza generovaná AI ', bold: 'nepředstavuje právní radu ani právní posudek', post: '.' },
          { pre: 'Výsledky analýzy ', bold: 'nemohou nahradit konzultaci s kvalifikovaným právníkem', post: '.' },
          { pre: 'DocThink ', bold: 'nezaručuje úplnost, přesnost ani aktuálnost', post: ' poskytnutých výstupů.' },
        ],
      },
      liability: {
        h: '3. Omezení odpovědnosti',
        p1: 'Provozovatel DocThink nenese žádnou odpovědnost za škody, ztráty ani jiné újmy, které vzniknou v důsledku rozhodnutí učiněných na základě výstupů aplikace. Uživatel používá aplikaci výhradně na vlastní riziko.',
        p2: 'AI modely mohou generovat nepřesné, neúplné nebo zavádějící informace. Každá smlouva má svá specifika a závazná interpretace vyžaduje posouzení odborníkem se znalostí platného práva a konkrétního kontextu.',
      },
      rec: {
        h: '4. Doporučení', intro: 'Před podpisem jakékoliv smlouvy, zejména té s vyšší hodnotou nebo závazností, vždy doporučujeme:',
        items: [
          'Konzultovat smlouvu s advokátem nebo jiným právním odborníkem.',
          'Ověřit si aktuální právní předpisy platné ve vaší zemi.',
          'Využít analýzu DocThink jako první orientační krok, nikoliv jako finální stanovisko.',
        ],
      },
      law: { h: '5. Rozhodné právo', p: 'Toto upozornění se řídí právním řádem České republiky. Veškeré spory budou řešeny před příslušnými soudy České republiky.' },
      contact: { h: '6. Kontakt', p: 'Dotazy: info@docthink.app' },
      lnks: { privacy: 'Ochrana osobních údajů', back: '← Zpět do aplikace' },
    },
  },

  en: {
    privacy: {
      title: 'Privacy Policy', updated: 'Last updated: 11 May 2025',
      op: { h: '1. Operator', p: 'DocThink is operated as an individual project. Contact: info@docthink.app' },
      data: {
        h: '2. What data we process',
        items: [
          { lb: 'Login credentials', tx: 'email and password for account creation (managed by Clerk, Inc.)' },
          { lb: 'Documents and photos', tx: 'files you upload for analysis. They are not stored permanently — sent to the AI model and discarded after analysis.' },
          { lb: 'Payment data', tx: 'processed exclusively by Stripe, Inc. We have no access to your card number.' },
          { lb: 'Credit balance', tx: 'we only store the number of remaining analyses on your account.' },
        ],
      },
      purpose: { h: '3. Purpose of processing', items: ['Providing AI-powered contract and document analysis service', 'Managing user accounts and credits', 'Processing payments for premium credits'] },
      third: {
        h: '4. Third parties',
        items: [
          { nm: 'Clerk', dc: 'authentication', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'AI document analysis', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'payments', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'credit count storage', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookies', p: 'We use only technical cookies necessary for login and application functionality. We do not use advertising or tracking cookies.' },
      rights: { h: '6. Your rights', p: 'You have the right to access, correct, or delete your data. Send your request to info@docthink.app. Your account can be deleted directly in the application.' },
      security: { h: '7. Security', p: 'All communication is encrypted via HTTPS. Documents are not stored long-term on our servers.' },
      contact: { h: '8. Contact', p: 'Data protection questions: info@docthink.app' },
    },
    terms: {
      title: 'Terms of Use', updated: 'Last updated: 26 May 2025',
      op: { h: '1. Operator', p: 'DocThink is operated as an individual project. Contact: info@docthink.app. By using the service, you agree to these terms.' },
      service: { h: '2. Service description', p: 'DocThink is an AI tool for analyzing contracts and documents. The service identifies risky clauses, missing provisions, and generates recommendations. Outputs are for informational purposes only and do not constitute legal advice.' },
      account: {
        h: '3. User account and credits',
        items: [
          'Registration is free. New accounts receive initial credits for testing the service.',
          'Each document analysis deducts 1 credit from your balance.',
          'Credits can be purchased via the Stripe payment gateway. Payments are non-refundable unless otherwise agreed.',
          'Purchased credits do not expire.',
          'Unused credits are not refunded upon account deletion.',
        ],
      },
      usage: {
        h: '4. Acceptable use', intro: 'You agree not to:',
        items: [
          'Upload content that infringes copyright or third-party rights.',
          'Misuse the service for automated mass processing without operator consent.',
          'Attempt to circumvent security mechanisms or service restrictions.',
          'Share account credentials with third parties.',
        ],
      },
      liability: { h: '5. Limitation of liability', p: 'DocThink is provided "as is" without warranty of accuracy, completeness, or fitness for a specific purpose. The operator is not liable for any damages resulting from reliance on AI analysis outputs. The user bears full responsibility for their decisions.' },
      avail: { h: '6. Service availability', p: 'The operator strives to ensure continuous service but cannot exclude outages due to maintenance or technical issues. The operator reserves the right to suspend or terminate the service at any time.' },
      changes: { h: '7. Changes to terms', p: 'The operator reserves the right to change these terms at any time. Registered users will be notified of significant changes by email. Continued use of the service after changes constitutes acceptance of the new terms.' },
      law: { h: '8. Governing law', p: 'These terms are governed by the laws of the Czech Republic. Any disputes will be resolved before the competent courts of the Czech Republic.' },
      contact: { h: '9. Contact', p: 'Questions about terms: info@docthink.app' },
      lnks: { privacy: 'Privacy Policy', disclaimer: 'Legal Notice', back: '← Back to app' },
    },
    disclaimer: {
      title: 'Legal Notice', updated: 'Last updated: 26 May 2025',
      warn: 'DocThink is not a legal advisor. Application outputs are for informational purposes only and do not replace professional legal assistance.',
      what: { h: '1. What DocThink does', p: 'DocThink is a tool using artificial intelligence (AI) for automatic analysis of contract documents. The application identifies potentially risky formulations, missing provisions, and recommends a verdict (sign / modify / reject) based on the content of the uploaded document.' },
      whatnot: {
        h: '2. What DocThink is NOT',
        items: [
          { pre: 'DocThink ', bold: 'is not a lawyer, attorney, or legal advisor', post: '.' },
          { pre: 'The AI-generated analysis ', bold: 'does not constitute legal advice or a legal opinion', post: '.' },
          { pre: 'Analysis results ', bold: 'cannot replace consultation with a qualified lawyer', post: '.' },
          { pre: 'DocThink ', bold: 'does not guarantee completeness, accuracy, or timeliness', post: ' of the provided outputs.' },
        ],
      },
      liability: {
        h: '3. Limitation of liability',
        p1: 'The operator of DocThink bears no responsibility for any damages, losses, or other harm resulting from decisions made based on application outputs. The user uses the application entirely at their own risk.',
        p2: 'AI models may generate inaccurate, incomplete, or misleading information. Each contract has its specifics and binding interpretation requires assessment by an expert with knowledge of applicable law and specific context.',
      },
      rec: {
        h: '4. Recommendations', intro: 'Before signing any contract, especially one of higher value or binding nature, we always recommend:',
        items: [
          'Consult the contract with a lawyer or other legal professional.',
          'Verify current legislation applicable in your country.',
          'Use DocThink\'s analysis as a first orientation step, not as a final opinion.',
        ],
      },
      law: { h: '5. Governing law', p: 'This notice is governed by the laws of the Czech Republic. All disputes will be resolved before the competent courts of the Czech Republic.' },
      contact: { h: '6. Contact', p: 'Questions: info@docthink.app' },
      lnks: { privacy: 'Privacy Policy', back: '← Back to app' },
    },
  },

  de: {
    privacy: {
      title: 'Datenschutzerklärung', updated: 'Zuletzt aktualisiert: 11. Mai 2025',
      op: { h: '1. Betreiber', p: 'DocThink wird als individuelles Projekt betrieben. Kontakt: info@docthink.app' },
      data: {
        h: '2. Welche Daten wir verarbeiten',
        items: [
          { lb: 'Anmeldedaten', tx: 'E-Mail und Passwort zur Kontoerstellung (verwaltet von Clerk, Inc.)' },
          { lb: 'Dokumente und Fotos', tx: 'Dateien, die Sie zur Analyse hochladen. Sie werden nicht dauerhaft gespeichert — sie werden an das KI-Modell gesendet und nach der Analyse verworfen.' },
          { lb: 'Zahlungsdaten', tx: 'werden ausschließlich von Stripe, Inc. verarbeitet. Wir haben keinen Zugriff auf Ihre Kartennummer.' },
          { lb: 'Guthaben', tx: 'wir speichern nur die Anzahl der verbleibenden Analysen auf Ihrem Konto.' },
        ],
      },
      purpose: { h: '3. Zweck der Verarbeitung', items: ['Bereitstellung des KI-gestützten Vertrags- und Dokumentenanalyseservice', 'Verwaltung von Benutzerkonten und Guthaben', 'Verarbeitung von Zahlungen für Premium-Guthaben'] },
      third: {
        h: '4. Drittanbieter',
        items: [
          { nm: 'Clerk', dc: 'Authentifizierung', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'KI-Dokumentenanalyse', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'Zahlungen', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'Guthabenspeicherung', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookies', p: 'Wir verwenden nur technisch notwendige Cookies für die Anmeldung und den Betrieb der Anwendung. Wir verwenden keine Werbe- oder Tracking-Cookies.' },
      rights: { h: '6. Ihre Rechte', p: 'Sie haben das Recht auf Zugang zu Ihren Daten, deren Berichtigung oder Löschung. Senden Sie Ihre Anfrage an info@docthink.app. Das Konto kann direkt in der Anwendung gelöscht werden.' },
      security: { h: '7. Sicherheit', p: 'Die gesamte Kommunikation ist über HTTPS verschlüsselt. Dokumente werden nicht langfristig auf unseren Servern gespeichert.' },
      contact: { h: '8. Kontakt', p: 'Fragen zum Datenschutz: info@docthink.app' },
    },
    terms: {
      title: 'Nutzungsbedingungen', updated: 'Zuletzt aktualisiert: 26. Mai 2025',
      op: { h: '1. Betreiber', p: 'DocThink wird als individuelles Projekt betrieben. Kontakt: info@docthink.app. Durch die Nutzung des Dienstes stimmen Sie diesen Bedingungen zu.' },
      service: { h: '2. Dienstbeschreibung', p: 'DocThink ist ein KI-Tool zur Analyse von Verträgen und Dokumenten. Der Dienst identifiziert riskante Klauseln, fehlende Bestimmungen und generiert Empfehlungen. Die Ergebnisse sind rein informativ und stellen keine Rechtsberatung dar.' },
      account: {
        h: '3. Benutzerkonto und Guthaben',
        items: [
          'Die Registrierung ist kostenlos. Neue Konten erhalten Startguthaben zum Testen des Dienstes.',
          'Jede Dokumentenanalyse zieht 1 Guthaben von Ihrem Kontostand ab.',
          'Guthaben können über das Stripe-Zahlungsgateway erworben werden. Zahlungen sind nicht erstattungsfähig, sofern nichts anderes vereinbart wurde.',
          'Erworbenes Guthaben hat kein Ablaufdatum.',
          'Ungenutztes Guthaben wird bei Kontolöschung nicht erstattet.',
        ],
      },
      usage: {
        h: '4. Zulässige Nutzung', intro: 'Sie verpflichten sich, nicht:',
        items: [
          'Inhalte hochzuladen, die Urheberrechte oder Rechte Dritter verletzen.',
          'Den Dienst für automatisierte Massenverarbeitung ohne Zustimmung des Betreibers zu missbrauchen.',
          'Versuchen, Sicherheitsmechanismen oder Dienstbeschränkungen zu umgehen.',
          'Zugangsdaten des Kontos mit Dritten zu teilen.',
        ],
      },
      liability: { h: '5. Haftungsbeschränkung', p: 'DocThink wird „wie es ist" ohne Gewährleistung der Richtigkeit, Vollständigkeit oder Eignung für einen bestimmten Zweck bereitgestellt. Der Betreiber haftet nicht für Schäden, die durch das Vertrauen auf KI-Analyseergebnisse entstehen. Der Nutzer trägt die volle Verantwortung für seine Entscheidungen.' },
      avail: { h: '6. Dienstverfügbarkeit', p: 'Der Betreiber bemüht sich um einen unterbrechungsfreien Betrieb, schließt jedoch Ausfälle aufgrund von Wartung oder technischen Problemen nicht aus. Der Betreiber behält sich das Recht vor, den Dienst jederzeit auszusetzen oder zu beenden.' },
      changes: { h: '7. Änderungen der Bedingungen', p: 'Der Betreiber behält sich das Recht vor, die Bedingungen jederzeit zu ändern. Registrierte Nutzer werden über wesentliche Änderungen per E-Mail informiert. Die weitere Nutzung des Dienstes nach Änderungen bedeutet die Zustimmung zu den neuen Bedingungen.' },
      law: { h: '8. Anwendbares Recht', p: 'Diese Bedingungen unterliegen dem Recht der Tschechischen Republik. Etwaige Streitigkeiten werden vor den zuständigen Gerichten der Tschechischen Republik gelöst.' },
      contact: { h: '9. Kontakt', p: 'Fragen zu den Bedingungen: info@docthink.app' },
      lnks: { privacy: 'Datenschutzerklärung', disclaimer: 'Rechtlicher Hinweis', back: '← Zurück zur App' },
    },
    disclaimer: {
      title: 'Rechtlicher Hinweis', updated: 'Zuletzt aktualisiert: 26. Mai 2025',
      warn: 'DocThink ist kein Rechtsberater. Die Anwendungsergebnisse dienen nur zu Informationszwecken und ersetzen keine professionelle Rechtsberatung.',
      what: { h: '1. Was DocThink tut', p: 'DocThink ist ein KI-Tool zur automatischen Analyse von Vertragsdokumenten. Die Anwendung identifiziert potenziell riskante Formulierungen, fehlende Bestimmungen und empfiehlt ein Urteil (unterschreiben / ändern / ablehnen) basierend auf dem Inhalt des hochgeladenen Dokuments.' },
      whatnot: {
        h: '2. Was DocThink NICHT ist',
        items: [
          { pre: 'DocThink ', bold: 'ist kein Anwalt, Jurist oder Rechtsberater', post: '.' },
          { pre: 'Die KI-generierte Analyse ', bold: 'stellt keine Rechtsberatung oder ein Rechtsgutachten dar', post: '.' },
          { pre: 'Analyseergebnisse ', bold: 'können die Beratung durch einen qualifizierten Anwalt nicht ersetzen', post: '.' },
          { pre: 'DocThink ', bold: 'garantiert keine Vollständigkeit, Richtigkeit oder Aktualität', post: ' der bereitgestellten Ergebnisse.' },
        ],
      },
      liability: {
        h: '3. Haftungsbeschränkung',
        p1: 'Der Betreiber von DocThink übernimmt keine Verantwortung für Schäden, Verluste oder andere Nachteile, die durch Entscheidungen entstehen, die auf Grundlage der Anwendungsergebnisse getroffen wurden. Der Nutzer verwendet die Anwendung ausschließlich auf eigenes Risiko.',
        p2: 'KI-Modelle können ungenaue, unvollständige oder irreführende Informationen generieren. Jeder Vertrag hat seine Besonderheiten und eine verbindliche Auslegung erfordert die Beurteilung durch einen Experten mit Kenntnissen des geltenden Rechts und des spezifischen Kontexts.',
      },
      rec: {
        h: '4. Empfehlungen', intro: 'Bevor Sie einen Vertrag unterzeichnen, insbesondere einen mit höherem Wert oder größerer Verbindlichkeit, empfehlen wir immer:',
        items: [
          'Den Vertrag mit einem Anwalt oder einem anderen Rechtsexperten zu besprechen.',
          'Die aktuell in Ihrem Land geltende Gesetzgebung zu überprüfen.',
          'Die DocThink-Analyse als ersten Orientierungsschritt zu nutzen, nicht als endgültige Meinung.',
        ],
      },
      law: { h: '5. Anwendbares Recht', p: 'Dieser Hinweis unterliegt dem Recht der Tschechischen Republik. Alle Streitigkeiten werden vor den zuständigen Gerichten der Tschechischen Republik gelöst.' },
      contact: { h: '6. Kontakt', p: 'Fragen: info@docthink.app' },
      lnks: { privacy: 'Datenschutzerklärung', back: '← Zurück zur App' },
    },
  },

  sk: {
    privacy: {
      title: 'Ochrana osobných údajov', updated: 'Posledná aktualizácia: 11. 5. 2025',
      op: { h: '1. Prevádzkovateľ', p: 'DocThink je prevádzkovaný ako individuálny projekt. Kontakt: info@docthink.app' },
      data: {
        h: '2. Aké údaje spracúvame',
        items: [
          { lb: 'Prihlasovacie údaje', tx: 'e-mail a heslo pre vytvorenie účtu (spravuje Clerk, Inc.)' },
          { lb: 'Dokumenty a fotografie', tx: 'súbory, ktoré nahráš za účelom analýzy. Nie sú trvalo ukladané — sú odoslané AI modelu a po analýze zahodené.' },
          { lb: 'Platobné údaje', tx: 'spracúva výhradne Stripe, Inc. My nemáme prístup k číslu karty.' },
          { lb: 'Počet kreditov', tx: 'ukladáme iba počet zostávajúcich analýz na tvojom účte.' },
        ],
      },
      purpose: { h: '3. Účel spracúvania', items: ['Poskytnutie služby analýzy zmlúv a dokumentov pomocou AI', 'Správa používateľského účtu a kreditov', 'Spracovanie platieb za prémiové kredity'] },
      third: {
        h: '4. Tretie strany',
        items: [
          { nm: 'Clerk', dc: 'autentifikácia', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'AI analýza dokumentov', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'platby', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'ukladanie počtu kreditov', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookies', p: 'Používame iba technické cookies nevyhnutné pre prihlásenie a prevádzku aplikácie. Nepoužívame reklamné ani sledovacie cookies.' },
      rights: { h: '6. Tvoje práva', p: 'Máš právo na prístup k svojim údajom, ich opravu alebo vymazanie. Žiadosť pošli na info@docthink.app. Účet možno vymazať priamo v aplikácii.' },
      security: { h: '7. Bezpečnosť', p: 'Všetka komunikácia je šifrovaná cez HTTPS. Dokumenty nie sú dlhodobo ukladané na serveroch.' },
      contact: { h: '8. Kontakt', p: 'Otázky k ochrane údajov: info@docthink.app' },
    },
    terms: {
      title: 'Podmienky používania', updated: 'Posledná aktualizácia: 26. 5. 2025',
      op: { h: '1. Prevádzkovateľ', p: 'Službu DocThink prevádzkuje individuálny projekt. Kontakt: info@docthink.app. Používaním služby súhlasíte s týmito podmienkami.' },
      service: { h: '2. Popis služby', p: 'DocThink je AI nástroj na analýzu zmlúv a dokumentov. Služba identifikuje rizikové klauzuly, chýbajúce ustanovenia a generuje odporúčania. Výstupy majú výhradne informatívny charakter a nepredstavujú právne poradenstvo.' },
      account: {
        h: '3. Používateľský účet a kredity',
        items: [
          'Registrácia je bezplatná. Nový účet obdrží počiatočné kredity na testovanie služby.',
          'Každá analýza dokumentu odpočíta 1 kredit z vášho zostatku.',
          'Kredity možno zakúpiť cez platobnú bránu Stripe. Platby sú nevratné, pokiaľ nie je dohodnuté inak.',
          'Zakúpené kredity nemajú dobu platnosti.',
          'Nevyužité kredity nie sú pri zrušení účtu preplácané.',
        ],
      },
      usage: {
        h: '4. Povolené použitie', intro: 'Zaväzujete sa, že nebudete:',
        items: [
          'Nahrávať obsah porušujúci autorské práva alebo práva tretích strán.',
          'Zneužívať službu na automatizované hromadné spracovanie bez súhlasu prevádzkovateľa.',
          'Pokúšať sa obísť bezpečnostné mechanizmy alebo obmedzenia služby.',
          'Zdieľať prístupové údaje k účtu s tretími osobami.',
        ],
      },
      liability: { h: '5. Obmedzenie zodpovednosti', p: 'DocThink je poskytovaný „tak ako je" bez záruky presnosti, úplnosti alebo vhodnosti pre konkrétny účel. Prevádzkovateľ nenesie zodpovednosť za akékoľvek škody vzniknuté v dôsledku spoliehania sa na výstupy AI analýzy. Používateľ nesie plnú zodpovednosť za svoje rozhodnutia.' },
      avail: { h: '6. Dostupnosť služby', p: 'Prevádzkovateľ sa snaží zabezpečiť nepretržitú prevádzku, ale nevylučuje výpadky z dôvodu údržby alebo technických problémov. Prevádzkovateľ si vyhradzuje právo kedykoľvek pozastaviť alebo ukončiť poskytovanie služby.' },
      changes: { h: '7. Zmeny podmienok', p: 'Prevádzkovateľ si vyhradzuje právo podmienky kedykoľvek zmeniť. O podstatných zmenách budú registrovaní používatelia informovaní emailom. Ďalšie používanie služby po zmene podmienok znamená súhlas s novými podmienkami.' },
      law: { h: '8. Rozhodné právo', p: 'Tieto podmienky sa riadia právnym poriadkom Českej republiky. Prípadné spory budú riešené pred príslušnými súdmi Českej republiky.' },
      contact: { h: '9. Kontakt', p: 'Otázky k podmienkam: info@docthink.app' },
      lnks: { privacy: 'Ochrana osobných údajov', disclaimer: 'Právne upozornenie', back: '← Späť do aplikácie' },
    },
    disclaimer: {
      title: 'Právne upozornenie', updated: 'Posledná aktualizácia: 26. 5. 2025',
      warn: 'DocThink nie je právny poradca. Výstupy aplikácie majú iba informatívny charakter a nenahradzujú odbornú právnu pomoc.',
      what: { h: '1. Čo DocThink robí', p: 'DocThink je nástroj využívajúci umelú inteligenciu (AI) na automatickú analýzu zmluvných dokumentov. Aplikácia identifikuje potenciálne rizikové formulácie, chýbajúce ujednania a odporúča verdikt (podpísať / upraviť / odmietnuť) na základe obsahu nahraného dokumentu.' },
      whatnot: {
        h: '2. Čím DocThink NIE JE',
        items: [
          { pre: 'DocThink ', bold: 'nie je advokát, právnik ani právny poradca', post: '.' },
          { pre: 'Analýza generovaná AI ', bold: 'nepredstavuje právnu radu ani právny posudok', post: '.' },
          { pre: 'Výsledky analýzy ', bold: 'nemôžu nahradiť konzultáciu s kvalifikovaným právnikom', post: '.' },
          { pre: 'DocThink ', bold: 'nezaručuje úplnosť, presnosť ani aktuálnosť', post: ' poskytnutých výstupov.' },
        ],
      },
      liability: {
        h: '3. Obmedzenie zodpovednosti',
        p1: 'Prevádzkovateľ DocThink nenesie žiadnu zodpovednosť za škody, straty ani iné ujmy, ktoré vzniknú v dôsledku rozhodnutí prijatých na základe výstupov aplikácie. Používateľ používa aplikáciu výhradne na vlastné riziko.',
        p2: 'AI modely môžu generovať nepresné, neúplné alebo zavádzajúce informácie. Každá zmluva má svoje špecifiká a záväzná interpretácia vyžaduje posúdenie odborníkom so znalosťou platného práva a konkrétneho kontextu.',
      },
      rec: {
        h: '4. Odporúčania', intro: 'Pred podpisom akejkoľvek zmluvy, najmä tej s vyššou hodnotou alebo záväznosťou, vždy odporúčame:',
        items: [
          'Konzultovať zmluvu s advokátom alebo iným právnym odborníkom.',
          'Overiť si aktuálne právne predpisy platné vo vašej krajine.',
          'Využiť analýzu DocThink ako prvý orientačný krok, nie ako finálne stanovisko.',
        ],
      },
      law: { h: '5. Rozhodné právo', p: 'Toto upozornenie sa riadi právnym poriadkom Českej republiky. Všetky spory budú riešené pred príslušnými súdmi Českej republiky.' },
      contact: { h: '6. Kontakt', p: 'Otázky: info@docthink.app' },
      lnks: { privacy: 'Ochrana osobných údajov', back: '← Späť do aplikácie' },
    },
  },

  fr: {
    privacy: {
      title: 'Politique de confidentialité', updated: 'Dernière mise à jour : 11 mai 2025',
      op: { h: '1. Opérateur', p: 'DocThink est exploité en tant que projet individuel. Contact : info@docthink.app' },
      data: {
        h: '2. Quelles données nous traitons',
        items: [
          { lb: 'Identifiants de connexion', tx: 'e-mail et mot de passe pour la création du compte (géré par Clerk, Inc.)' },
          { lb: 'Documents et photos', tx: 'fichiers que vous téléchargez à des fins d\'analyse. Ils ne sont pas stockés de façon permanente — envoyés au modèle IA et supprimés après l\'analyse.' },
          { lb: 'Données de paiement', tx: 'traitées exclusivement par Stripe, Inc. Nous n\'avons pas accès à votre numéro de carte.' },
          { lb: 'Solde de crédits', tx: 'nous ne stockons que le nombre d\'analyses restantes sur votre compte.' },
        ],
      },
      purpose: { h: '3. Finalité du traitement', items: ['Fourniture du service d\'analyse de contrats et documents par IA', 'Gestion des comptes utilisateurs et des crédits', 'Traitement des paiements pour les crédits premium'] },
      third: {
        h: '4. Tiers',
        items: [
          { nm: 'Clerk', dc: 'authentification', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'analyse IA de documents', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'paiements', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'stockage du solde de crédits', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookies', p: 'Nous utilisons uniquement les cookies techniques nécessaires à la connexion et au fonctionnement de l\'application. Nous n\'utilisons pas de cookies publicitaires ou de suivi.' },
      rights: { h: '6. Vos droits', p: 'Vous avez le droit d\'accéder à vos données, de les corriger ou de les supprimer. Envoyez votre demande à info@docthink.app. Le compte peut être supprimé directement dans l\'application.' },
      security: { h: '7. Sécurité', p: 'Toutes les communications sont chiffrées via HTTPS. Les documents ne sont pas stockés à long terme sur nos serveurs.' },
      contact: { h: '8. Contact', p: 'Questions sur la protection des données : info@docthink.app' },
    },
    terms: {
      title: 'Conditions d\'utilisation', updated: 'Dernière mise à jour : 26 mai 2025',
      op: { h: '1. Opérateur', p: 'DocThink est exploité en tant que projet individuel. Contact : info@docthink.app. En utilisant le service, vous acceptez ces conditions.' },
      service: { h: '2. Description du service', p: 'DocThink est un outil IA d\'analyse de contrats et documents. Le service identifie les clauses risquées, les dispositions manquantes et génère des recommandations. Les résultats sont uniquement à titre informatif et ne constituent pas un conseil juridique.' },
      account: {
        h: '3. Compte utilisateur et crédits',
        items: [
          'L\'inscription est gratuite. Les nouveaux comptes reçoivent des crédits initiaux pour tester le service.',
          'Chaque analyse de document déduit 1 crédit de votre solde.',
          'Les crédits peuvent être achetés via la passerelle de paiement Stripe. Les paiements sont non remboursables sauf accord contraire.',
          'Les crédits achetés n\'ont pas de date d\'expiration.',
          'Les crédits non utilisés ne sont pas remboursés lors de la suppression du compte.',
        ],
      },
      usage: {
        h: '4. Utilisation acceptable', intro: 'Vous vous engagez à ne pas :',
        items: [
          'Télécharger du contenu violant des droits d\'auteur ou des droits de tiers.',
          'Utiliser abusivement le service pour un traitement automatisé en masse sans l\'accord de l\'opérateur.',
          'Tenter de contourner les mécanismes de sécurité ou les restrictions du service.',
          'Partager vos identifiants de compte avec des tiers.',
        ],
      },
      liability: { h: '5. Limitation de responsabilité', p: 'DocThink est fourni « tel quel » sans garantie d\'exactitude, d\'exhaustivité ou d\'adéquation à un usage particulier. L\'opérateur n\'est pas responsable des dommages résultant de la confiance accordée aux résultats d\'analyse IA. L\'utilisateur assume l\'entière responsabilité de ses décisions.' },
      avail: { h: '6. Disponibilité du service', p: 'L\'opérateur s\'efforce d\'assurer un service continu mais ne peut exclure des interruptions dues à la maintenance ou à des problèmes techniques. L\'opérateur se réserve le droit de suspendre ou d\'arrêter le service à tout moment.' },
      changes: { h: '7. Modifications des conditions', p: 'L\'opérateur se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs enregistrés seront informés des modifications importantes par e-mail. La poursuite de l\'utilisation du service après les modifications constitue une acceptation des nouvelles conditions.' },
      law: { h: '8. Droit applicable', p: 'Ces conditions sont régies par le droit de la République tchèque. Tout litige sera résolu devant les tribunaux compétents de la République tchèque.' },
      contact: { h: '9. Contact', p: 'Questions sur les conditions : info@docthink.app' },
      lnks: { privacy: 'Politique de confidentialité', disclaimer: 'Avis juridique', back: '← Retour à l\'application' },
    },
    disclaimer: {
      title: 'Avis juridique', updated: 'Dernière mise à jour : 26 mai 2025',
      warn: 'DocThink n\'est pas un conseiller juridique. Les résultats de l\'application sont uniquement à titre informatif et ne remplacent pas une assistance juridique professionnelle.',
      what: { h: '1. Ce que fait DocThink', p: 'DocThink est un outil utilisant l\'intelligence artificielle (IA) pour l\'analyse automatique de documents contractuels. L\'application identifie les formulations potentiellement risquées, les dispositions manquantes et recommande un verdict (signer / modifier / rejeter) basé sur le contenu du document téléchargé.' },
      whatnot: {
        h: '2. Ce que DocThink N\'EST PAS',
        items: [
          { pre: 'DocThink ', bold: 'n\'est pas un avocat, un juriste ou un conseiller juridique', post: '.' },
          { pre: 'L\'analyse générée par IA ', bold: 'ne constitue pas un conseil juridique ou un avis juridique', post: '.' },
          { pre: 'Les résultats d\'analyse ', bold: 'ne peuvent pas remplacer la consultation d\'un avocat qualifié', post: '.' },
          { pre: 'DocThink ', bold: 'ne garantit pas l\'exhaustivité, l\'exactitude ou l\'actualité', post: ' des résultats fournis.' },
        ],
      },
      liability: {
        h: '3. Limitation de responsabilité',
        p1: 'L\'opérateur de DocThink n\'assume aucune responsabilité pour les dommages, pertes ou autres préjudices résultant de décisions prises sur la base des résultats de l\'application. L\'utilisateur utilise l\'application entièrement à ses propres risques.',
        p2: 'Les modèles IA peuvent générer des informations inexactes, incomplètes ou trompeuses. Chaque contrat a ses spécificités et une interprétation contraignante nécessite l\'évaluation d\'un expert connaissant le droit applicable et le contexte spécifique.',
      },
      rec: {
        h: '4. Recommandations', intro: 'Avant de signer tout contrat, surtout celui de valeur ou de portée élevée, nous recommandons toujours :',
        items: [
          'Consulter le contrat avec un avocat ou un autre professionnel juridique.',
          'Vérifier la législation en vigueur applicable dans votre pays.',
          'Utiliser l\'analyse DocThink comme première étape d\'orientation, pas comme avis final.',
        ],
      },
      law: { h: '5. Droit applicable', p: 'Cet avis est régi par le droit de la République tchèque. Tous les litiges seront résolus devant les tribunaux compétents de la République tchèque.' },
      contact: { h: '6. Contact', p: 'Questions : info@docthink.app' },
      lnks: { privacy: 'Politique de confidentialité', back: '← Retour à l\'application' },
    },
  },

  es: {
    privacy: {
      title: 'Política de privacidad', updated: 'Última actualización: 11 de mayo de 2025',
      op: { h: '1. Operador', p: 'DocThink se opera como un proyecto individual. Contacto: info@docthink.app' },
      data: {
        h: '2. Qué datos procesamos',
        items: [
          { lb: 'Credenciales de acceso', tx: 'correo electrónico y contraseña para la creación de cuenta (gestionado por Clerk, Inc.)' },
          { lb: 'Documentos y fotos', tx: 'archivos que subes para análisis. No se almacenan de forma permanente — se envían al modelo IA y se descartan tras el análisis.' },
          { lb: 'Datos de pago', tx: 'procesados exclusivamente por Stripe, Inc. No tenemos acceso a tu número de tarjeta.' },
          { lb: 'Saldo de créditos', tx: 'solo almacenamos el número de análisis restantes en tu cuenta.' },
        ],
      },
      purpose: { h: '3. Finalidad del tratamiento', items: ['Prestación del servicio de análisis de contratos y documentos mediante IA', 'Gestión de cuentas de usuario y créditos', 'Procesamiento de pagos por créditos premium'] },
      third: {
        h: '4. Terceros',
        items: [
          { nm: 'Clerk', dc: 'autenticación', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'análisis IA de documentos', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'pagos', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'almacenamiento del saldo de créditos', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookies', p: 'Utilizamos solo las cookies técnicas necesarias para el inicio de sesión y el funcionamiento de la aplicación. No utilizamos cookies publicitarias ni de seguimiento.' },
      rights: { h: '6. Tus derechos', p: 'Tienes derecho a acceder a tus datos, corregirlos o eliminarlos. Envía tu solicitud a info@docthink.app. La cuenta se puede eliminar directamente en la aplicación.' },
      security: { h: '7. Seguridad', p: 'Todas las comunicaciones están cifradas mediante HTTPS. Los documentos no se almacenan a largo plazo en nuestros servidores.' },
      contact: { h: '8. Contacto', p: 'Preguntas sobre protección de datos: info@docthink.app' },
    },
    terms: {
      title: 'Términos de uso', updated: 'Última actualización: 26 de mayo de 2025',
      op: { h: '1. Operador', p: 'DocThink se opera como un proyecto individual. Contacto: info@docthink.app. Al usar el servicio, aceptas estos términos.' },
      service: { h: '2. Descripción del servicio', p: 'DocThink es una herramienta IA para analizar contratos y documentos. El servicio identifica cláusulas de riesgo, disposiciones faltantes y genera recomendaciones. Los resultados son puramente informativos y no constituyen asesoramiento jurídico.' },
      account: {
        h: '3. Cuenta de usuario y créditos',
        items: [
          'El registro es gratuito. Las nuevas cuentas reciben créditos iniciales para probar el servicio.',
          'Cada análisis de documento deduce 1 crédito de tu saldo.',
          'Los créditos se pueden comprar a través de la pasarela de pago Stripe. Los pagos no son reembolsables salvo acuerdo contrario.',
          'Los créditos adquiridos no tienen fecha de caducidad.',
          'Los créditos no utilizados no se reembolsan al eliminar la cuenta.',
        ],
      },
      usage: {
        h: '4. Uso permitido', intro: 'Te comprometes a no:',
        items: [
          'Subir contenido que infrinja derechos de autor o derechos de terceros.',
          'Hacer un uso indebido del servicio para el procesamiento masivo automatizado sin el consentimiento del operador.',
          'Intentar eludir los mecanismos de seguridad o las restricciones del servicio.',
          'Compartir las credenciales de tu cuenta con terceros.',
        ],
      },
      liability: { h: '5. Limitación de responsabilidad', p: 'DocThink se proporciona "tal cual" sin garantía de exactitud, integridad o idoneidad para un propósito específico. El operador no es responsable de daños derivados de confiar en los resultados del análisis IA. El usuario asume plena responsabilidad por sus decisiones.' },
      avail: { h: '6. Disponibilidad del servicio', p: 'El operador se esfuerza por garantizar un servicio continuo pero no puede excluir interrupciones por mantenimiento o problemas técnicos. El operador se reserva el derecho de suspender o terminar el servicio en cualquier momento.' },
      changes: { h: '7. Cambios en los términos', p: 'El operador se reserva el derecho de cambiar estos términos en cualquier momento. Los usuarios registrados serán notificados de cambios importantes por correo electrónico. El uso continuado del servicio tras los cambios constituye aceptación de los nuevos términos.' },
      law: { h: '8. Ley aplicable', p: 'Estos términos se rigen por la legislación de la República Checa. Cualquier disputa se resolverá ante los tribunales competentes de la República Checa.' },
      contact: { h: '9. Contacto', p: 'Preguntas sobre los términos: info@docthink.app' },
      lnks: { privacy: 'Política de privacidad', disclaimer: 'Aviso legal', back: '← Volver a la aplicación' },
    },
    disclaimer: {
      title: 'Aviso legal', updated: 'Última actualización: 26 de mayo de 2025',
      warn: 'DocThink no es un asesor jurídico. Los resultados de la aplicación son solo informativos y no reemplazan la asistencia jurídica profesional.',
      what: { h: '1. Qué hace DocThink', p: 'DocThink es una herramienta que utiliza inteligencia artificial (IA) para el análisis automático de documentos contractuales. La aplicación identifica formulaciones potencialmente arriesgadas, disposiciones faltantes y recomienda un veredicto (firmar / modificar / rechazar) basado en el contenido del documento subido.' },
      whatnot: {
        h: '2. Lo que DocThink NO ES',
        items: [
          { pre: 'DocThink ', bold: 'no es un abogado, jurista ni asesor legal', post: '.' },
          { pre: 'El análisis generado por IA ', bold: 'no constituye asesoramiento jurídico ni un dictamen legal', post: '.' },
          { pre: 'Los resultados del análisis ', bold: 'no pueden reemplazar la consulta con un abogado cualificado', post: '.' },
          { pre: 'DocThink ', bold: 'no garantiza la exhaustividad, exactitud ni actualidad', post: ' de los resultados proporcionados.' },
        ],
      },
      liability: {
        h: '3. Limitación de responsabilidad',
        p1: 'El operador de DocThink no asume ninguna responsabilidad por daños, pérdidas u otros perjuicios derivados de decisiones tomadas basándose en los resultados de la aplicación. El usuario utiliza la aplicación bajo su propio riesgo.',
        p2: 'Los modelos IA pueden generar información inexacta, incompleta o engañosa. Cada contrato tiene sus especificidades y la interpretación vinculante requiere la evaluación de un experto con conocimiento de la legislación aplicable y el contexto específico.',
      },
      rec: {
        h: '4. Recomendaciones', intro: 'Antes de firmar cualquier contrato, especialmente uno de mayor valor o carácter vinculante, siempre recomendamos:',
        items: [
          'Consultar el contrato con un abogado u otro profesional jurídico.',
          'Verificar la legislación vigente aplicable en tu país.',
          'Utilizar el análisis de DocThink como primer paso orientativo, no como opinión final.',
        ],
      },
      law: { h: '5. Ley aplicable', p: 'Este aviso se rige por la legislación de la República Checa. Todos los litigios se resolverán ante los tribunales competentes de la República Checa.' },
      contact: { h: '6. Contacto', p: 'Preguntas: info@docthink.app' },
      lnks: { privacy: 'Política de privacidad', back: '← Volver a la aplicación' },
    },
  },

  it: {
    privacy: {
      title: 'Informativa sulla privacy', updated: 'Ultimo aggiornamento: 11 maggio 2025',
      op: { h: '1. Titolare', p: 'DocThink è gestito come progetto individuale. Contatto: info@docthink.app' },
      data: {
        h: '2. Quali dati trattiamo',
        items: [
          { lb: 'Credenziali di accesso', tx: 'email e password per la creazione dell\'account (gestito da Clerk, Inc.)' },
          { lb: 'Documenti e foto', tx: 'file caricati per l\'analisi. Non vengono archiviati permanentemente — inviati al modello IA e cancellati dopo l\'analisi.' },
          { lb: 'Dati di pagamento', tx: 'trattati esclusivamente da Stripe, Inc. Non abbiamo accesso al numero della tua carta.' },
          { lb: 'Saldo crediti', tx: 'archiviamo solo il numero di analisi rimanenti nel tuo account.' },
        ],
      },
      purpose: { h: '3. Finalità del trattamento', items: ['Fornitura del servizio di analisi di contratti e documenti tramite IA', 'Gestione degli account utente e dei crediti', 'Elaborazione dei pagamenti per i crediti premium'] },
      third: {
        h: '4. Terze parti',
        items: [
          { nm: 'Clerk', dc: 'autenticazione', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'analisi IA dei documenti', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'pagamenti', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'archiviazione saldo crediti', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookie', p: 'Utilizziamo solo i cookie tecnici necessari per il login e il funzionamento dell\'applicazione. Non utilizziamo cookie pubblicitari o di tracciamento.' },
      rights: { h: '6. I tuoi diritti', p: 'Hai il diritto di accedere ai tuoi dati, correggerli o cancellarli. Invia la tua richiesta a info@docthink.app. L\'account può essere eliminato direttamente nell\'applicazione.' },
      security: { h: '7. Sicurezza', p: 'Tutte le comunicazioni sono crittografate tramite HTTPS. I documenti non vengono archiviati a lungo termine sui nostri server.' },
      contact: { h: '8. Contatto', p: 'Domande sulla protezione dei dati: info@docthink.app' },
    },
    terms: {
      title: 'Termini di utilizzo', updated: 'Ultimo aggiornamento: 26 maggio 2025',
      op: { h: '1. Titolare', p: 'DocThink è gestito come progetto individuale. Contatto: info@docthink.app. Utilizzando il servizio, accetti questi termini.' },
      service: { h: '2. Descrizione del servizio', p: 'DocThink è uno strumento IA per l\'analisi di contratti e documenti. Il servizio identifica clausole rischiose, disposizioni mancanti e genera raccomandazioni. I risultati sono puramente informativi e non costituiscono consulenza legale.' },
      account: {
        h: '3. Account utente e crediti',
        items: [
          'La registrazione è gratuita. I nuovi account ricevono crediti iniziali per testare il servizio.',
          'Ogni analisi di documento scala 1 credito dal tuo saldo.',
          'I crediti possono essere acquistati tramite il gateway di pagamento Stripe. I pagamenti non sono rimborsabili salvo diverso accordo.',
          'I crediti acquistati non hanno data di scadenza.',
          'I crediti non utilizzati non vengono rimborsati in caso di eliminazione dell\'account.',
        ],
      },
      usage: {
        h: '4. Uso consentito', intro: 'Ti impegni a non:',
        items: [
          'Caricare contenuti che violano diritti d\'autore o diritti di terzi.',
          'Abusare del servizio per l\'elaborazione automatizzata di massa senza il consenso del titolare.',
          'Tentare di aggirare i meccanismi di sicurezza o le restrizioni del servizio.',
          'Condividere le credenziali dell\'account con terzi.',
        ],
      },
      liability: { h: '5. Limitazione di responsabilità', p: 'DocThink è fornito "così com\'è" senza garanzia di accuratezza, completezza o idoneità a uno scopo specifico. Il titolare non è responsabile per danni derivanti dall\'affidamento sui risultati dell\'analisi IA. L\'utente si assume la piena responsabilità delle proprie decisioni.' },
      avail: { h: '6. Disponibilità del servizio', p: 'Il titolare si impegna a garantire un servizio continuo ma non può escludere interruzioni dovute a manutenzione o problemi tecnici. Il titolare si riserva il diritto di sospendere o terminare il servizio in qualsiasi momento.' },
      changes: { h: '7. Modifiche ai termini', p: 'Il titolare si riserva il diritto di modificare questi termini in qualsiasi momento. Gli utenti registrati saranno informati delle modifiche significative via email. L\'uso continuato del servizio dopo le modifiche costituisce accettazione dei nuovi termini.' },
      law: { h: '8. Legge applicabile', p: 'Questi termini sono regolati dalla legge della Repubblica Ceca. Eventuali controversie saranno risolte davanti ai tribunali competenti della Repubblica Ceca.' },
      contact: { h: '9. Contatto', p: 'Domande sui termini: info@docthink.app' },
      lnks: { privacy: 'Informativa sulla privacy', disclaimer: 'Avviso legale', back: '← Torna all\'applicazione' },
    },
    disclaimer: {
      title: 'Avviso legale', updated: 'Ultimo aggiornamento: 26 maggio 2025',
      warn: 'DocThink non è un consulente legale. I risultati dell\'applicazione sono solo informativi e non sostituiscono l\'assistenza legale professionale.',
      what: { h: '1. Cosa fa DocThink', p: 'DocThink è uno strumento che utilizza l\'intelligenza artificiale (IA) per l\'analisi automatica di documenti contrattuali. L\'applicazione identifica formulazioni potenzialmente rischiose, disposizioni mancanti e raccomanda un verdetto (firmare / modificare / rifiutare) basato sul contenuto del documento caricato.' },
      whatnot: {
        h: '2. Cosa DocThink NON È',
        items: [
          { pre: 'DocThink ', bold: 'non è un avvocato, un giurista o un consulente legale', post: '.' },
          { pre: 'L\'analisi generata dall\'IA ', bold: 'non costituisce consulenza legale o un parere giuridico', post: '.' },
          { pre: 'I risultati dell\'analisi ', bold: 'non possono sostituire la consulenza con un avvocato qualificato', post: '.' },
          { pre: 'DocThink ', bold: 'non garantisce la completezza, l\'accuratezza o l\'attualità', post: ' dei risultati forniti.' },
        ],
      },
      liability: {
        h: '3. Limitazione di responsabilità',
        p1: 'Il titolare di DocThink non si assume alcuna responsabilità per danni, perdite o altri pregiudizi derivanti da decisioni prese sulla base dei risultati dell\'applicazione. L\'utente utilizza l\'applicazione interamente a proprio rischio.',
        p2: 'I modelli IA possono generare informazioni inaccurate, incomplete o fuorvianti. Ogni contratto ha le sue specificità e l\'interpretazione vincolante richiede la valutazione di un esperto con conoscenza della legge applicabile e del contesto specifico.',
      },
      rec: {
        h: '4. Raccomandazioni', intro: 'Prima di firmare qualsiasi contratto, specialmente uno di valore o portata elevata, raccomandiamo sempre:',
        items: [
          'Consultare il contratto con un avvocato o un altro professionista legale.',
          'Verificare la legislazione vigente applicabile nel proprio paese.',
          'Utilizzare l\'analisi DocThink come primo passo orientativo, non come parere definitivo.',
        ],
      },
      law: { h: '5. Legge applicabile', p: 'Questo avviso è regolato dalla legge della Repubblica Ceca. Tutte le controversie saranno risolte davanti ai tribunali competenti della Repubblica Ceca.' },
      contact: { h: '6. Contatto', p: 'Domande: info@docthink.app' },
      lnks: { privacy: 'Informativa sulla privacy', back: '← Torna all\'applicazione' },
    },
  },

  pl: {
    privacy: {
      title: 'Polityka prywatności', updated: 'Ostatnia aktualizacja: 11 maja 2025',
      op: { h: '1. Operator', p: 'DocThink jest prowadzony jako indywidualny projekt. Kontakt: info@docthink.app' },
      data: {
        h: '2. Jakie dane przetwarzamy',
        items: [
          { lb: 'Dane logowania', tx: 'e-mail i hasło do tworzenia konta (zarządzane przez Clerk, Inc.)' },
          { lb: 'Dokumenty i zdjęcia', tx: 'pliki przesyłane do analizy. Nie są przechowywane na stałe — wysyłane do modelu AI i usuwane po analizie.' },
          { lb: 'Dane płatności', tx: 'przetwarzane wyłącznie przez Stripe, Inc. Nie mamy dostępu do Twojego numeru karty.' },
          { lb: 'Saldo kredytów', tx: 'przechowujemy tylko liczbę pozostałych analiz na Twoim koncie.' },
        ],
      },
      purpose: { h: '3. Cel przetwarzania', items: ['Świadczenie usługi analizy umów i dokumentów przy użyciu AI', 'Zarządzanie kontami użytkowników i kredytami', 'Przetwarzanie płatności za kredyty premium'] },
      third: {
        h: '4. Podmioty trzecie',
        items: [
          { nm: 'Clerk', dc: 'uwierzytelnianie', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'analiza dokumentów przez AI', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'płatności', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'przechowywanie salda kredytów', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Pliki cookie', p: 'Używamy tylko technicznych plików cookie niezbędnych do logowania i działania aplikacji. Nie używamy reklamowych ani śledzących plików cookie.' },
      rights: { h: '6. Twoje prawa', p: 'Masz prawo dostępu do swoich danych, ich poprawienia lub usunięcia. Wyślij prośbę na info@docthink.app. Konto można usunąć bezpośrednio w aplikacji.' },
      security: { h: '7. Bezpieczeństwo', p: 'Cała komunikacja jest szyfrowana przez HTTPS. Dokumenty nie są długoterminowo przechowywane na naszych serwerach.' },
      contact: { h: '8. Kontakt', p: 'Pytania dotyczące ochrony danych: info@docthink.app' },
    },
    terms: {
      title: 'Warunki korzystania', updated: 'Ostatnia aktualizacja: 26 maja 2025',
      op: { h: '1. Operator', p: 'DocThink jest prowadzony jako indywidualny projekt. Kontakt: info@docthink.app. Korzystając z usługi, akceptujesz niniejsze warunki.' },
      service: { h: '2. Opis usługi', p: 'DocThink jest narzędziem AI do analizy umów i dokumentów. Usługa identyfikuje ryzykowne klauzule, brakujące postanowienia i generuje rekomendacje. Wyniki mają charakter wyłącznie informacyjny i nie stanowią porady prawnej.' },
      account: {
        h: '3. Konto użytkownika i kredyty',
        items: [
          'Rejestracja jest bezpłatna. Nowe konta otrzymują początkowe kredyty do testowania usługi.',
          'Każda analiza dokumentu potrąca 1 kredyt z Twojego salda.',
          'Kredyty można kupić za pośrednictwem bramki płatniczej Stripe. Płatności są bezzwrotne, chyba że uzgodniono inaczej.',
          'Zakupione kredyty nie mają daty ważności.',
          'Niewykorzystane kredyty nie są zwracane przy usunięciu konta.',
        ],
      },
      usage: {
        h: '4. Dozwolone użycie', intro: 'Zobowiązujesz się, że nie będziesz:',
        items: [
          'Przesyłać treści naruszających prawa autorskie lub prawa osób trzecich.',
          'Nadużywać usługi do zautomatyzowanego masowego przetwarzania bez zgody operatora.',
          'Próbować obejść mechanizmy bezpieczeństwa lub ograniczenia usługi.',
          'Udostępniać danych logowania do konta osobom trzecim.',
        ],
      },
      liability: { h: '5. Ograniczenie odpowiedzialności', p: 'DocThink jest dostarczany „tak jak jest" bez gwarancji dokładności, kompletności lub przydatności do określonego celu. Operator nie ponosi odpowiedzialności za szkody wynikające z polegania na wynikach analizy AI. Użytkownik ponosi pełną odpowiedzialność za swoje decyzje.' },
      avail: { h: '6. Dostępność usługi', p: 'Operator stara się zapewnić ciągłe działanie, ale nie wyklucza przerw z powodu konserwacji lub problemów technicznych. Operator zastrzega sobie prawo do zawieszenia lub zakończenia usługi w dowolnym momencie.' },
      changes: { h: '7. Zmiany warunków', p: 'Operator zastrzega sobie prawo do zmiany warunków w dowolnym momencie. Zarejestrowani użytkownicy będą informowani o istotnych zmianach pocztą elektroniczną. Dalsze korzystanie z usługi po zmianach oznacza akceptację nowych warunków.' },
      law: { h: '8. Prawo właściwe', p: 'Niniejsze warunki podlegają prawu Republiki Czeskiej. Ewentualne spory będą rozstrzygane przed właściwymi sądami Republiki Czeskiej.' },
      contact: { h: '9. Kontakt', p: 'Pytania dotyczące warunków: info@docthink.app' },
      lnks: { privacy: 'Polityka prywatności', disclaimer: 'Informacja prawna', back: '← Powrót do aplikacji' },
    },
    disclaimer: {
      title: 'Informacja prawna', updated: 'Ostatnia aktualizacja: 26 maja 2025',
      warn: 'DocThink nie jest doradcą prawnym. Wyniki aplikacji mają jedynie charakter informacyjny i nie zastępują profesjonalnej pomocy prawnej.',
      what: { h: '1. Co robi DocThink', p: 'DocThink jest narzędziem wykorzystującym sztuczną inteligencję (AI) do automatycznej analizy dokumentów umownych. Aplikacja identyfikuje potencjalnie ryzykowne sformułowania, brakujące postanowienia i rekomenduje werdykt (podpisać / zmienić / odrzucić) na podstawie treści przesłanego dokumentu.' },
      whatnot: {
        h: '2. Czym DocThink NIE JEST',
        items: [
          { pre: 'DocThink ', bold: 'nie jest prawnikiem, adwokatem ani doradcą prawnym', post: '.' },
          { pre: 'Analiza wygenerowana przez AI ', bold: 'nie stanowi porady prawnej ani opinii prawnej', post: '.' },
          { pre: 'Wyniki analizy ', bold: 'nie mogą zastąpić konsultacji z wykwalifikowanym prawnikiem', post: '.' },
          { pre: 'DocThink ', bold: 'nie gwarantuje kompletności, dokładności ani aktualności', post: ' dostarczonych wyników.' },
        ],
      },
      liability: {
        h: '3. Ograniczenie odpowiedzialności',
        p1: 'Operator DocThink nie ponosi żadnej odpowiedzialności za szkody, straty ani inne uszczerbki wynikające z decyzji podjętych na podstawie wyników aplikacji. Użytkownik korzysta z aplikacji wyłącznie na własne ryzyko.',
        p2: 'Modele AI mogą generować niedokładne, niekompletne lub wprowadzające w błąd informacje. Każda umowa ma swoje specyfiki, a wiążąca interpretacja wymaga oceny przez eksperta znającego obowiązujące prawo i konkretny kontekst.',
      },
      rec: {
        h: '4. Zalecenia', intro: 'Przed podpisaniem jakiejkolwiek umowy, zwłaszcza tej o wyższej wartości lub wiążącym charakterze, zawsze zalecamy:',
        items: [
          'Skonsultować umowę z prawnikiem lub innym specjalistą prawnym.',
          'Zweryfikować aktualne przepisy prawne obowiązujące w swoim kraju.',
          'Używać analizy DocThink jako pierwszego kroku orientacyjnego, nie jako ostatecznej opinii.',
        ],
      },
      law: { h: '5. Prawo właściwe', p: 'Niniejsza informacja podlega prawu Republiki Czeskiej. Wszystkie spory będą rozstrzygane przed właściwymi sądami Republiki Czeskiej.' },
      contact: { h: '6. Kontakt', p: 'Pytania: info@docthink.app' },
      lnks: { privacy: 'Polityka prywatności', back: '← Powrót do aplikacji' },
    },
  },

  nl: {
    privacy: {
      title: 'Privacybeleid', updated: 'Laatste update: 11 mei 2025',
      op: { h: '1. Beheerder', p: 'DocThink wordt beheerd als een individueel project. Contact: info@docthink.app' },
      data: {
        h: '2. Welke gegevens we verwerken',
        items: [
          { lb: 'Inloggegevens', tx: 'e-mail en wachtwoord voor het aanmaken van een account (beheerd door Clerk, Inc.)' },
          { lb: 'Documenten en foto\'s', tx: 'bestanden die u uploadt voor analyse. Ze worden niet permanent opgeslagen — naar het AI-model gestuurd en na de analyse verwijderd.' },
          { lb: 'Betalingsgegevens', tx: 'uitsluitend verwerkt door Stripe, Inc. Wij hebben geen toegang tot uw kaartnummer.' },
          { lb: 'Creditsaldo', tx: 'we slaan alleen het aantal resterende analyses op uw account op.' },
        ],
      },
      purpose: { h: '3. Doel van verwerking', items: ['Levering van de AI-aangedreven contract- en documentanalyseservice', 'Beheer van gebruikersaccounts en credits', 'Verwerking van betalingen voor premium credits'] },
      third: {
        h: '4. Derde partijen',
        items: [
          { nm: 'Clerk', dc: 'authenticatie', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'AI-documentanalyse', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'betalingen', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'opslag creditsaldo', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookies', p: 'We gebruiken alleen technisch noodzakelijke cookies voor inloggen en het functioneren van de applicatie. We gebruiken geen advertentie- of trackingcookies.' },
      rights: { h: '6. Uw rechten', p: 'U heeft het recht om uw gegevens in te zien, te corrigeren of te verwijderen. Stuur uw verzoek naar info@docthink.app. Het account kan direct in de applicatie worden verwijderd.' },
      security: { h: '7. Beveiliging', p: 'Alle communicatie is versleuteld via HTTPS. Documenten worden niet langdurig op onze servers opgeslagen.' },
      contact: { h: '8. Contact', p: 'Vragen over gegevensbescherming: info@docthink.app' },
    },
    terms: {
      title: 'Gebruiksvoorwaarden', updated: 'Laatste update: 26 mei 2025',
      op: { h: '1. Beheerder', p: 'DocThink wordt beheerd als een individueel project. Contact: info@docthink.app. Door gebruik te maken van de service gaat u akkoord met deze voorwaarden.' },
      service: { h: '2. Beschrijving van de service', p: 'DocThink is een AI-tool voor het analyseren van contracten en documenten. De service identificeert riskante clausules, ontbrekende bepalingen en genereert aanbevelingen. De resultaten zijn uitsluitend informatief en vormen geen juridisch advies.' },
      account: {
        h: '3. Gebruikersaccount en credits',
        items: [
          'Registratie is gratis. Nieuwe accounts ontvangen startcredits om de service te testen.',
          'Elke documentanalyse trekt 1 credit af van uw saldo.',
          'Credits kunnen worden gekocht via de Stripe-betalingsgateway. Betalingen zijn niet restitueerbaar tenzij anders overeengekomen.',
          'Gekochte credits hebben geen vervaldatum.',
          'Ongebruikte credits worden niet terugbetaald bij het verwijderen van het account.',
        ],
      },
      usage: {
        h: '4. Toegestaan gebruik', intro: 'U stemt ermee in niet:',
        items: [
          'Inhoud te uploaden die auteursrechten of rechten van derden schendt.',
          'De service te misbruiken voor geautomatiseerde massaverwerking zonder toestemming van de beheerder.',
          'Te proberen beveiligingsmechanismen of servicebeperkingen te omzeilen.',
          'Accountgegevens te delen met derden.',
        ],
      },
      liability: { h: '5. Beperking van aansprakelijkheid', p: 'DocThink wordt geleverd "zoals het is" zonder garantie van nauwkeurigheid, volledigheid of geschiktheid voor een specifiek doel. De beheerder is niet aansprakelijk voor schade als gevolg van het vertrouwen op AI-analyseresultaten. De gebruiker draagt de volledige verantwoordelijkheid voor zijn beslissingen.' },
      avail: { h: '6. Beschikbaarheid van de service', p: 'De beheerder streeft naar een continue service maar kan onderbrekingen door onderhoud of technische problemen niet uitsluiten. De beheerder behoudt zich het recht voor om de service op elk moment te onderbreken of te beëindigen.' },
      changes: { h: '7. Wijzigingen in de voorwaarden', p: 'De beheerder behoudt zich het recht voor om deze voorwaarden op elk moment te wijzigen. Geregistreerde gebruikers worden via e-mail op de hoogte gesteld van belangrijke wijzigingen. Voortgezet gebruik van de service na wijzigingen houdt acceptatie van de nieuwe voorwaarden in.' },
      law: { h: '8. Toepasselijk recht', p: 'Deze voorwaarden worden beheerst door het recht van de Tsjechische Republiek. Eventuele geschillen worden beslecht voor de bevoegde rechtbanken van de Tsjechische Republiek.' },
      contact: { h: '9. Contact', p: 'Vragen over de voorwaarden: info@docthink.app' },
      lnks: { privacy: 'Privacybeleid', disclaimer: 'Juridische mededeling', back: '← Terug naar app' },
    },
    disclaimer: {
      title: 'Juridische mededeling', updated: 'Laatste update: 26 mei 2025',
      warn: 'DocThink is geen juridisch adviseur. De applicatieresultaten zijn uitsluitend informatief en vervangen geen professionele juridische bijstand.',
      what: { h: '1. Wat DocThink doet', p: 'DocThink is een tool die kunstmatige intelligentie (AI) gebruikt voor automatische analyse van contractdocumenten. De applicatie identificeert potentieel riskante formuleringen, ontbrekende bepalingen en beveelt een oordeel aan (ondertekenen / wijzigen / afwijzen) op basis van de inhoud van het geüploade document.' },
      whatnot: {
        h: '2. Wat DocThink NIET IS',
        items: [
          { pre: 'DocThink ', bold: 'is geen advocaat, jurist of juridisch adviseur', post: '.' },
          { pre: 'De AI-gegenereerde analyse ', bold: 'vormt geen juridisch advies of juridisch oordeel', post: '.' },
          { pre: 'Analyseresultaten ', bold: 'kunnen overleg met een gekwalificeerde advocaat niet vervangen', post: '.' },
          { pre: 'DocThink ', bold: 'garandeert geen volledigheid, nauwkeurigheid of actualiteit', post: ' van de geleverde resultaten.' },
        ],
      },
      liability: {
        h: '3. Beperking van aansprakelijkheid',
        p1: 'De beheerder van DocThink aanvaardt geen verantwoordelijkheid voor schade, verliezen of andere nadelen als gevolg van beslissingen genomen op basis van applicatieresultaten. De gebruiker gebruikt de applicatie volledig op eigen risico.',
        p2: 'AI-modellen kunnen onnauwkeurige, onvolledige of misleidende informatie genereren. Elk contract heeft zijn specificiteiten en een bindende interpretatie vereist de beoordeling van een expert met kennis van het toepasselijk recht en de specifieke context.',
      },
      rec: {
        h: '4. Aanbevelingen', intro: 'Voordat u een contract ondertekent, vooral een contract van hogere waarde of bindende aard, raden wij altijd aan:',
        items: [
          'Het contract te raadplegen met een advocaat of andere juridische professional.',
          'De geldende wetgeving in uw land te controleren.',
          'De DocThink-analyse te gebruiken als eerste oriëntatiestap, niet als definitief advies.',
        ],
      },
      law: { h: '5. Toepasselijk recht', p: 'Deze mededeling wordt beheerst door het recht van de Tsjechische Republiek. Alle geschillen worden beslecht voor de bevoegde rechtbanken van de Tsjechische Republiek.' },
      contact: { h: '6. Contact', p: 'Vragen: info@docthink.app' },
      lnks: { privacy: 'Privacybeleid', back: '← Terug naar app' },
    },
  },

  pt: {
    privacy: {
      title: 'Política de privacidade', updated: 'Última atualização: 11 de maio de 2025',
      op: { h: '1. Operador', p: 'DocThink é operado como um projeto individual. Contacto: info@docthink.app' },
      data: {
        h: '2. Que dados tratamos',
        items: [
          { lb: 'Credenciais de acesso', tx: 'e-mail e palavra-passe para criação de conta (gerido pelo Clerk, Inc.)' },
          { lb: 'Documentos e fotos', tx: 'ficheiros que carrega para análise. Não são armazenados permanentemente — enviados para o modelo IA e descartados após a análise.' },
          { lb: 'Dados de pagamento', tx: 'tratados exclusivamente pelo Stripe, Inc. Não temos acesso ao número do seu cartão.' },
          { lb: 'Saldo de créditos', tx: 'armazenamos apenas o número de análises restantes na sua conta.' },
        ],
      },
      purpose: { h: '3. Finalidade do tratamento', items: ['Prestação do serviço de análise de contratos e documentos com IA', 'Gestão de contas de utilizador e créditos', 'Processamento de pagamentos por créditos premium'] },
      third: {
        h: '4. Terceiros',
        items: [
          { nm: 'Clerk', dc: 'autenticação', url: 'https://clerk.com/privacy' },
          { nm: 'Anthropic', dc: 'análise IA de documentos', url: 'https://anthropic.com/privacy' },
          { nm: 'Stripe', dc: 'pagamentos', url: 'https://stripe.com/privacy' },
          { nm: 'Upstash', dc: 'armazenamento do saldo de créditos', url: 'https://upstash.com/privacy' },
        ],
      },
      cookies: { h: '5. Cookies', p: 'Usamos apenas cookies técnicos necessários para o login e funcionamento da aplicação. Não usamos cookies publicitários ou de rastreamento.' },
      rights: { h: '6. Os seus direitos', p: 'Tem o direito de aceder aos seus dados, corrigi-los ou eliminá-los. Envie o seu pedido para info@docthink.app. A conta pode ser eliminada diretamente na aplicação.' },
      security: { h: '7. Segurança', p: 'Todas as comunicações são encriptadas via HTTPS. Os documentos não são armazenados a longo prazo nos nossos servidores.' },
      contact: { h: '8. Contacto', p: 'Questões sobre proteção de dados: info@docthink.app' },
    },
    terms: {
      title: 'Termos de utilização', updated: 'Última atualização: 26 de maio de 2025',
      op: { h: '1. Operador', p: 'DocThink é operado como um projeto individual. Contacto: info@docthink.app. Ao usar o serviço, concorda com estes termos.' },
      service: { h: '2. Descrição do serviço', p: 'DocThink é uma ferramenta IA para análise de contratos e documentos. O serviço identifica cláusulas de risco, disposições em falta e gera recomendações. Os resultados são puramente informativos e não constituem aconselhamento jurídico.' },
      account: {
        h: '3. Conta de utilizador e créditos',
        items: [
          'O registo é gratuito. As novas contas recebem créditos iniciais para testar o serviço.',
          'Cada análise de documento deduz 1 crédito do seu saldo.',
          'Os créditos podem ser comprados através do gateway de pagamento Stripe. Os pagamentos não são reembolsáveis salvo acordo em contrário.',
          'Os créditos adquiridos não têm data de validade.',
          'Os créditos não utilizados não são reembolsados ao eliminar a conta.',
        ],
      },
      usage: {
        h: '4. Uso permitido', intro: 'Compromete-se a não:',
        items: [
          'Carregar conteúdo que viole direitos de autor ou direitos de terceiros.',
          'Usar indevidamente o serviço para processamento automatizado em massa sem o consentimento do operador.',
          'Tentar contornar mecanismos de segurança ou restrições do serviço.',
          'Partilhar credenciais de conta com terceiros.',
        ],
      },
      liability: { h: '5. Limitação de responsabilidade', p: 'DocThink é fornecido "tal como está" sem garantia de exatidão, completude ou adequação a um propósito específico. O operador não é responsável por danos resultantes de confiar nos resultados da análise IA. O utilizador assume total responsabilidade pelas suas decisões.' },
      avail: { h: '6. Disponibilidade do serviço', p: 'O operador esforça-se por garantir um serviço contínuo mas não pode excluir interrupções por manutenção ou problemas técnicos. O operador reserva-se o direito de suspender ou terminar o serviço a qualquer momento.' },
      changes: { h: '7. Alterações aos termos', p: 'O operador reserva-se o direito de alterar estes termos a qualquer momento. Os utilizadores registados serão notificados de alterações significativas por e-mail. O uso continuado do serviço após as alterações constitui aceitação dos novos termos.' },
      law: { h: '8. Lei aplicável', p: 'Estes termos são regidos pela lei da República Checa. Quaisquer litígios serão resolvidos nos tribunais competentes da República Checa.' },
      contact: { h: '9. Contacto', p: 'Questões sobre os termos: info@docthink.app' },
      lnks: { privacy: 'Política de privacidade', disclaimer: 'Aviso legal', back: '← Voltar à aplicação' },
    },
    disclaimer: {
      title: 'Aviso legal', updated: 'Última atualização: 26 de maio de 2025',
      warn: 'DocThink não é um consultor jurídico. Os resultados da aplicação são apenas informativos e não substituem a assistência jurídica profissional.',
      what: { h: '1. O que o DocThink faz', p: 'DocThink é uma ferramenta que usa inteligência artificial (IA) para análise automática de documentos contratuais. A aplicação identifica formulações potencialmente arriscadas, disposições em falta e recomenda um veredicto (assinar / modificar / rejeitar) com base no conteúdo do documento carregado.' },
      whatnot: {
        h: '2. O que o DocThink NÃO É',
        items: [
          { pre: 'DocThink ', bold: 'não é um advogado, jurista ou consultor jurídico', post: '.' },
          { pre: 'A análise gerada pela IA ', bold: 'não constitui aconselhamento jurídico ou parecer legal', post: '.' },
          { pre: 'Os resultados da análise ', bold: 'não podem substituir a consulta com um advogado qualificado', post: '.' },
          { pre: 'DocThink ', bold: 'não garante a completude, exatidão ou atualidade', post: ' dos resultados fornecidos.' },
        ],
      },
      liability: {
        h: '3. Limitação de responsabilidade',
        p1: 'O operador do DocThink não assume qualquer responsabilidade por danos, perdas ou outros prejuízos resultantes de decisões tomadas com base nos resultados da aplicação. O utilizador usa a aplicação inteiramente por sua conta e risco.',
        p2: 'Os modelos IA podem gerar informações imprecisas, incompletas ou enganosas. Cada contrato tem as suas especificidades e a interpretação vinculativa requer a avaliação de um especialista com conhecimento da lei aplicável e do contexto específico.',
      },
      rec: {
        h: '4. Recomendações', intro: 'Antes de assinar qualquer contrato, especialmente um de maior valor ou caráter vinculativo, recomendamos sempre:',
        items: [
          'Consultar o contrato com um advogado ou outro profissional jurídico.',
          'Verificar a legislação vigente aplicável no seu país.',
          'Usar a análise DocThink como primeiro passo de orientação, não como opinião final.',
        ],
      },
      law: { h: '5. Lei aplicável', p: 'Este aviso é regido pela lei da República Checa. Todos os litígios serão resolvidos nos tribunais competentes da República Checa.' },
      contact: { h: '6. Contacto', p: 'Questões: info@docthink.app' },
      lnks: { privacy: 'Política de privacidade', back: '← Voltar à aplicação' },
    },
  },
}

export function getLegal(lang: LangKey): LegalT {
  return (legalTranslations[lang] ?? legalTranslations.en) as LegalT
}

export interface FeedbackT {
  title: string; sub: string
  nameLabel: string; namePlaceholder: string
  emailLabel: string; emailPlaceholder: string
  messageLabel: string; messagePlaceholder: string
  sendBtn: string; sendingBtn: string
  successTitle: string; successSub: string
  back: string
}

const feedbackTranslations: Partial<Record<string, FeedbackT>> = {
  cs: { title: 'Zpětná vazba', sub: 'Nahlaste chybu nebo sdílejte nápad jak DocThink vylepšit.', nameLabel: 'Jméno', namePlaceholder: 'Vaše jméno', emailLabel: 'Email', emailPlaceholder: 'vas@email.cz', messageLabel: 'Zpráva', messagePlaceholder: 'Co máte na mysli...', sendBtn: 'Odeslat zpětnou vazbu', sendingBtn: 'Odesílám…', successTitle: 'Díky za zpětnou vazbu!', successSub: 'Odpovíme na', back: '← Zpět do aplikace' },
  en: { title: 'Feedback', sub: 'Report a bug or share an idea to improve DocThink.', nameLabel: 'Name', namePlaceholder: 'Your name', emailLabel: 'Email', emailPlaceholder: 'your@email.com', messageLabel: 'Message', messagePlaceholder: 'What\'s on your mind...', sendBtn: 'Send feedback', sendingBtn: 'Sending…', successTitle: 'Thanks for your feedback!', successSub: 'We\'ll reply to', back: '← Back to app' },
  de: { title: 'Feedback', sub: 'Melden Sie einen Fehler oder teilen Sie eine Idee zur Verbesserung von DocThink.', nameLabel: 'Name', namePlaceholder: 'Ihr Name', emailLabel: 'E-Mail', emailPlaceholder: 'ihre@email.de', messageLabel: 'Nachricht', messagePlaceholder: 'Was haben Sie auf dem Herzen...', sendBtn: 'Feedback senden', sendingBtn: 'Wird gesendet…', successTitle: 'Danke für Ihr Feedback!', successSub: 'Wir antworten an', back: '← Zurück zur App' },
  sk: { title: 'Spätná väzba', sub: 'Nahláste chybu alebo zdieľajte nápad ako vylepšiť DocThink.', nameLabel: 'Meno', namePlaceholder: 'Vaše meno', emailLabel: 'Email', emailPlaceholder: 'vas@email.sk', messageLabel: 'Správa', messagePlaceholder: 'Čo máte na mysli...', sendBtn: 'Odoslať spätnú väzbu', sendingBtn: 'Odosielam…', successTitle: 'Ďakujeme za spätnú väzbu!', successSub: 'Odpovieme na', back: '← Späť do aplikácie' },
  fr: { title: 'Retour d\'information', sub: 'Signalez un bug ou partagez une idée pour améliorer DocThink.', nameLabel: 'Nom', namePlaceholder: 'Votre nom', emailLabel: 'E-mail', emailPlaceholder: 'votre@email.fr', messageLabel: 'Message', messagePlaceholder: 'Qu\'avez-vous à l\'esprit...', sendBtn: 'Envoyer le retour', sendingBtn: 'Envoi en cours…', successTitle: 'Merci pour votre retour !', successSub: 'Nous répondrons à', back: '← Retour à l\'application' },
  es: { title: 'Comentarios', sub: 'Informa de un error o comparte una idea para mejorar DocThink.', nameLabel: 'Nombre', namePlaceholder: 'Tu nombre', emailLabel: 'Correo', emailPlaceholder: 'tu@correo.es', messageLabel: 'Mensaje', messagePlaceholder: '¿Qué tienes en mente?', sendBtn: 'Enviar comentarios', sendingBtn: 'Enviando…', successTitle: '¡Gracias por tus comentarios!', successSub: 'Responderemos a', back: '← Volver a la aplicación' },
  it: { title: 'Feedback', sub: 'Segnala un bug o condividi un\'idea per migliorare DocThink.', nameLabel: 'Nome', namePlaceholder: 'Il tuo nome', emailLabel: 'Email', emailPlaceholder: 'tua@email.it', messageLabel: 'Messaggio', messagePlaceholder: 'Cosa hai in mente...', sendBtn: 'Invia feedback', sendingBtn: 'Invio in corso…', successTitle: 'Grazie per il tuo feedback!', successSub: 'Risponderemo a', back: '← Torna all\'applicazione' },
  pl: { title: 'Opinia', sub: 'Zgłoś błąd lub podziel się pomysłem na ulepszenie DocThink.', nameLabel: 'Imię', namePlaceholder: 'Twoje imię', emailLabel: 'Email', emailPlaceholder: 'twoj@email.pl', messageLabel: 'Wiadomość', messagePlaceholder: 'Co masz na myśli...', sendBtn: 'Wyślij opinię', sendingBtn: 'Wysyłanie…', successTitle: 'Dziękujemy za opinię!', successSub: 'Odpiszemy na', back: '← Powrót do aplikacji' },
  nl: { title: 'Feedback', sub: 'Meld een bug of deel een idee om DocThink te verbeteren.', nameLabel: 'Naam', namePlaceholder: 'Uw naam', emailLabel: 'E-mail', emailPlaceholder: 'uw@email.nl', messageLabel: 'Bericht', messagePlaceholder: 'Wat heeft u op uw hart...', sendBtn: 'Feedback verzenden', sendingBtn: 'Verzenden…', successTitle: 'Bedankt voor uw feedback!', successSub: 'We antwoorden op', back: '← Terug naar app' },
  pt: { title: 'Feedback', sub: 'Reporte um erro ou partilhe uma ideia para melhorar o DocThink.', nameLabel: 'Nome', namePlaceholder: 'O seu nome', emailLabel: 'Email', emailPlaceholder: 'seu@email.pt', messageLabel: 'Mensagem', messagePlaceholder: 'O que tem em mente...', sendBtn: 'Enviar feedback', sendingBtn: 'A enviar…', successTitle: 'Obrigado pelo seu feedback!', successSub: 'Responderemos a', back: '← Voltar à aplicação' },
}

export function getFeedback(lang: LangKey): FeedbackT {
  return (feedbackTranslations[lang] ?? feedbackTranslations.en) as FeedbackT
}
