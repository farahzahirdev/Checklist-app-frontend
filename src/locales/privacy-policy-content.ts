import type { Locale } from '@/lib/i18n';

export type PolicyParagraph = { type: 'p'; text: string };
export type PolicyList = { type: 'list'; items: string[] };
export type PolicySubsection = {
  type?: 'subsection';
  number: string;
  title: string;
  blocks: PolicyBlock[];
};
export type PolicyBlock = PolicyParagraph | PolicyList | PolicySubsection;

export type PolicySection = {
  number: string;
  title: string;
  blocks: PolicyBlock[];
};

export type PolicyContactBlock = {
  title: string;
  lines: string[];
};

export type PrivacyPolicyContent = {
  title: string;
  sections: PolicySection[];
  contactBlock?: PolicyContactBlock;
};

const cs: PrivacyPolicyContent = {
  title: 'Podmínky ochrany osobních údajů / Zásady zpracování osobních údajů',
  sections: [
    {
      number: '1',
      title: 'Identifikace správce osobních údajů',
      blocks: [
        { type: 'p', text: 'Správcem osobních údajů je společnost:' },
        {
          type: 'p',
          text: 'AuditReady s.r.o. se sídlem Francouzská 312/100, Vršovice, 101 00 Praha 10, IČO 06584128, zapsaná v obchodním rejstříku vedeném Městským soudem v Praze, oddíl C, vložka 284828, a jako správce zpracováváme vaše osobní údaje.',
        },
      ],
    },
    {
      number: '2',
      title: 'Rozsah působnosti těchto zásad',
      blocks: [
        {
          type: 'p',
          text: 'Tyto zásady se vztahují na zpracování osobních údajů, ke kterému dochází v souvislosti s provozem webových stránek Auditready, používáním webové aplikace Auditready a poskytováním souvisejících služeb.',
        },
        { type: 'p', text: 'Zásady se vztahují zejména na tyto osoby:' },
        {
          type: 'list',
          items: [
            'návštěvníky webových stránek Auditready,',
            'osoby, které nás kontaktují prostřednictvím kontaktního formuláře, e-mailu nebo jiného komunikačního kanálu,',
            'zájemce o naše služby,',
            'zákazníky a jejich kontaktní osoby,',
            'uživatele webové aplikace Auditready,',
            'osoby, jejichž údaje mohou být uvedeny v zákazníkem vložených podkladech, poznámkách, odpovědích nebo dokumentech.',
          ],
        },
        {
          type: 'p',
          text: 'Tyto zásady se vztahují jak na zpracování údajů při běžném používání webových stránek, tak na zpracování údajů v rámci uživatelského účtu, online checklistu, vyhodnocení odpovědí, tvorby výstupního reportu, fakturace, technické podpory a zajištění bezpečnosti služby.',
        },
        {
          type: 'p',
          text: 'Pokud zákazník do webové aplikace Auditready vkládá dokumenty, poznámky nebo jiné podklady obsahující osobní údaje třetích osob, odpovídá za to, že je oprávněn tyto údaje do aplikace vložit a že tím neporušuje práva dotčených osob ani jiné právní povinnosti.',
        },
        {
          type: 'p',
          text: 'Tyto zásady se nevztahují na webové stránky, aplikace nebo služby třetích stran, na které mohou webové stránky Auditready odkazovat. Za zpracování osobních údajů těmito třetími stranami odpovídají příslušní provozovatelé těchto služeb.',
        },
      ],
    },
    {
      number: '3',
      title: 'Jaké osobní údaje zpracováváme',
      blocks: [
        {
          type: 'p',
          text: 'V souvislosti s provozem webových stránek, webové aplikace a poskytováním služeb Auditready můžeme zpracovávat různé kategorie osobních údajů. Rozsah zpracovávaných údajů závisí na tom, zda jste pouze návštěvníkem webu, kontaktujete nás, vytvoříte si uživatelský účet, využijete naši službu nebo vystupujete jako kontaktní osoba zákazníka.',
        },
        {
          number: '3.1',
          title: 'Údaje návštěvníků webových stránek',
          blocks: [
            {
              type: 'p',
              text: 'Při návštěvě webových stránek Auditready můžeme zpracovávat zejména technické údaje související s používáním webu, například:',
            },
            {
              type: 'list',
              items: [
                'IP adresu,',
                'typ zařízení, prohlížeče a operačního systému,',
                'datum a čas návštěvy,',
                'navštívené stránky,',
                'údaje o chování na webu, pokud k tomu udělíte souhlas prostřednictvím cookie lišty,',
                'nastavení cookies a informace o uděleném nebo odmítnutém souhlasu.',
              ],
            },
            {
              type: 'p',
              text: 'Tyto údaje jsou zpracovávány zejména za účelem zajištění správného fungování webu, jeho bezpečnosti, základní technické správy a případně měření návštěvnosti, pokud s tím uživatel souhlasí.',
            },
          ],
        },
        {
          number: '3.2',
          title: 'Údaje osob, které nás kontaktují',
          blocks: [
            {
              type: 'p',
              text: 'Pokud nás kontaktujete prostřednictvím kontaktního formuláře, e-mailu, telefonu nebo jiného komunikačního kanálu, můžeme zpracovávat zejména:',
            },
            {
              type: 'list',
              items: [
                'jméno a příjmení,',
                'e-mailovou adresu,',
                'telefonní číslo, pokud nám jej poskytnete,',
                'název organizace,',
                'pracovní pozici nebo roli v organizaci, pokud ji uvedete,',
                'obsah zprávy,',
                'další údaje, které nám v rámci komunikace sami sdělíte.',
              ],
            },
            {
              type: 'p',
              text: 'Tyto údaje zpracováváme za účelem vyřízení vašeho dotazu, přípravy nabídky, komunikace se zájemcem nebo zákazníkem a vedení související obchodní komunikace.',
            },
          ],
        },
        {
          number: '3.3',
          title: 'Údaje zákazníků a uživatelů webové aplikace',
          blocks: [
            {
              type: 'p',
              text: 'Pokud využíváte webovou aplikaci Auditready nebo související online služby, můžeme zpracovávat zejména:',
            },
            {
              type: 'list',
              items: [
                'jméno a příjmení uživatele,',
                'e-mailovou adresu,',
                'název organizace,',
                'IČO a fakturační údaje organizace,',
                'roli nebo oprávnění uživatele v rámci aplikace,',
                'přihlašovací a identifikační údaje k uživatelskému účtu,',
                'údaje o využívání služby,',
                'historii objednávek, plateb a vygenerovaných výstupů,',
                'komunikaci s technickou nebo zákaznickou podporou.',
              ],
            },
            {
              type: 'p',
              text: 'Tyto údaje jsou nezbytné zejména pro vytvoření a správu uživatelského účtu, zpřístupnění zakoupené služby, správu zákaznického vztahu, fakturaci a podporu uživatele.',
            },
          ],
        },
        {
          number: '3.4',
          title: 'Údaje vložené do online checklistu a souvisejících podkladů',
          blocks: [
            {
              type: 'p',
              text: 'V rámci používání webové aplikace Auditready může zákazník nebo uživatel do aplikace vkládat odpovědi, poznámky, dokumenty nebo jiné podklady související s posouzením připravenosti organizace.',
            },
            { type: 'p', text: 'Tyto údaje mohou zahrnovat zejména:' },
            {
              type: 'list',
              items: [
                'odpovědi na otázky v online checklistu,',
                'poznámky a komentáře uživatele,',
                'informace o organizaci, jejích procesech, technických a organizačních opatřeních,',
                'informace o bezpečnostní dokumentaci,',
                'nahrané soubory a důkazní podklady,',
                'údaje obsažené ve vygenerovaném výstupním reportu.',
              ],
            },
            {
              type: 'p',
              text: 'V některých případech mohou tyto podklady obsahovat také osobní údaje třetích osob, například jména zaměstnanců, kontaktní údaje, pracovní role nebo informace uvedené v interních dokumentech zákazníka. Zákazník odpovídá za to, že do aplikace vkládá pouze takové údaje, které je oprávněn zpracovávat a předat společnosti AuditReady s.r.o. za účelem poskytnutí služby.',
            },
          ],
        },
        {
          number: '3.5',
          title: 'Platební a fakturační údaje',
          blocks: [
            {
              type: 'p',
              text: 'V souvislosti s objednávkou a úhradou služby můžeme zpracovávat zejména:',
            },
            {
              type: 'list',
              items: [
                'identifikační a fakturační údaje zákazníka,',
                'název organizace,',
                'IČO, DIČ, pokud je relevantní,',
                'fakturační adresu,',
                'kontaktní e-mail pro zaslání faktury,',
                'údaje o objednané službě,',
                'stav platby,',
                'identifikátor platby nebo transakce,',
                'údaje nezbytné pro vystavení a uchování účetních a daňových dokladů.',
              ],
            },
            {
              type: 'p',
              text: 'Údaje o platební kartě nezpracováváme přímo, pokud je platba prováděna prostřednictvím externího poskytovatele platebních služeb. V takovém případě jsou platební údaje zpracovávány přímo tímto poskytovatelem podle jeho vlastních pravidel a podmínek.',
            },
          ],
        },
        {
          number: '3.6',
          title: 'Technické, provozní a bezpečnostní údaje',
          blocks: [
            {
              type: 'p',
              text: 'Za účelem zajištění bezpečnosti, dostupnosti a řádného provozu webových stránek a webové aplikace můžeme zpracovávat také technické, provozní a bezpečnostní údaje, například:',
            },
            {
              type: 'list',
              items: [
                'IP adresu,',
                'čas přihlášení a odhlášení,',
                'záznamy o přístupech do uživatelského účtu,',
                'informace o provedených akcích v aplikaci,',
                'technické logy,',
                'informace o chybách aplikace,',
                'údaje potřebné k prevenci zneužití služby, neoprávněného přístupu nebo bezpečnostních incidentů.',
              ],
            },
            {
              type: 'p',
              text: 'Tyto údaje zpracováváme zejména za účelem ochrany uživatelských účtů, ochrany dat zákazníků, detekce technických problémů, zajištění provozu služby a ochrany práv a oprávněných zájmů společnosti AuditReady s.r.o.',
            },
          ],
        },
      ],
    },
    {
      number: '4',
      title: 'Účely a právní základy zpracování',
      blocks: [
        {
          type: 'p',
          text: 'Osobní údaje zpracováváme pouze v rozsahu nezbytném pro konkrétní účely uvedené níže. Ke každému účelu zpracování přiřazujeme odpovídající právní základ podle obecného nařízení o ochraně osobních údajů (GDPR).',
        },
        {
          number: '4.1',
          title: 'Provoz webových stránek a zajištění jejich funkčnosti',
          blocks: [
            {
              type: 'p',
              text: 'Osobní údaje a technické údaje návštěvníků webu zpracováváme za účelem zajištění správného fungování webových stránek, jejich bezpečnosti, dostupnosti, základní technické správy a zobrazení obsahu.',
            },
            {
              type: 'p',
              text: 'Právním základem tohoto zpracování je oprávněný zájem správce na provozu, správě a zabezpečení webových stránek. V případě technicky nezbytných cookies je zpracování nezbytné pro zajištění funkčnosti webu.',
            },
          ],
        },
        {
          number: '4.2',
          title: 'Komunikace se zájemci, zákazníky a dalšími osobami',
          blocks: [
            {
              type: 'p',
              text: 'Pokud nás kontaktujete prostřednictvím e-mailu, kontaktního formuláře, telefonu nebo jiného komunikačního kanálu, zpracováváme poskytnuté údaje za účelem vyřízení vašeho dotazu, odpovědi na zprávu, přípravy nabídky, sjednání podmínek spolupráce nebo navazující obchodní komunikace.',
            },
            {
              type: 'p',
              text: 'Právním základem je podle povahy komunikace provedení opatření před uzavřením smlouvy, plnění smlouvy nebo oprávněný zájem správce na vedení obchodní komunikace a vyřizování dotazů.',
            },
          ],
        },
        {
          number: '4.3',
          title: 'Vytvoření a správa uživatelského účtu',
          blocks: [
            {
              type: 'p',
              text: 'Osobní údaje uživatelů webové aplikace zpracováváme za účelem vytvoření, správy a zabezpečení uživatelského účtu, ověření identity uživatele, nastavení oprávnění, správy přístupů a umožnění používání zakoupené služby.',
            },
            {
              type: 'p',
              text: 'Právním základem je plnění smlouvy, případně provedení opatření před jejím uzavřením. U bezpečnostních opatření může být právním základem také oprávněný zájem správce na ochraně služby, uživatelských účtů a dat zákazníků.',
            },
          ],
        },
        {
          number: '4.4',
          title: 'Poskytnutí služby Auditready a vytvoření výstupního reportu',
          blocks: [
            {
              type: 'p',
              text: 'Údaje vložené do webové aplikace, zejména odpovědi v checklistu, poznámky, komentáře, informace o organizaci a případně nahrané podklady, zpracováváme za účelem poskytnutí služby Auditready, vyhodnocení zadaných odpovědí a vytvoření výstupního reportu.',
            },
            {
              type: 'p',
              text: 'Právním základem je plnění smlouvy mezi zákazníkem a společností AuditReady s.r.o. Pokud zákazník do aplikace vloží osobní údaje třetích osob, je odpovědný za to, že má pro jejich vložení a zpracování odpovídající právní základ.',
            },
          ],
        },
        {
          number: '4.5',
          title: 'Fakturace, účetnictví a plnění právních povinností',
          blocks: [
            {
              type: 'p',
              text: 'Identifikační, fakturační a platební údaje zpracováváme za účelem zpracování objednávky, úhrady služby, vystavení daňových a účetních dokladů, vedení účetnictví a plnění dalších zákonných povinností.',
            },
            {
              type: 'p',
              text: 'Právním základem je plnění smlouvy a plnění právních povinností, které se na správce vztahují, zejména v oblasti účetnictví a daní.',
            },
          ],
        },
        {
          number: '4.6',
          title: 'Technická podpora a řešení požadavků uživatelů',
          blocks: [
            {
              type: 'p',
              text: 'Údaje poskytnuté v rámci komunikace s technickou nebo zákaznickou podporou zpracováváme za účelem řešení uživatelských požadavků, technických problémů, reklamací, dotazů a zajištění řádného fungování služby.',
            },
            {
              type: 'p',
              text: 'Právním základem je plnění smlouvy, případně oprávněný zájem správce na zajištění podpory, řešení problémů a zlepšování poskytované služby.',
            },
          ],
        },
        {
          number: '4.7',
          title: 'Bezpečnost služby, ochrana účtů a prevence zneužití',
          blocks: [
            {
              type: 'p',
              text: 'Technické, provozní a bezpečnostní údaje zpracováváme za účelem ochrany webových stránek, webové aplikace, uživatelských účtů, dat zákazníků a infrastruktury. Tyto údaje mohou být využívány zejména k detekci chyb, neoprávněných přístupů, podezřelých aktivit, bezpečnostních incidentů nebo jiného zneužití služby.',
            },
            {
              type: 'p',
              text: 'Právním základem je oprávněný zájem správce na ochraně služby, zákazníků, dat, infrastruktury a právních nároků.',
            },
          ],
        },
        {
          number: '4.8',
          title: 'Analytika webu a zlepšování služeb',
          blocks: [
            {
              type: 'p',
              text: 'Pokud k tomu udělíte souhlas prostřednictvím cookie lišty nebo jiného obdobného nástroje, můžeme zpracovávat údaje o používání webových stránek za účelem měření návštěvnosti, vyhodnocení účinnosti obsahu, zlepšování webu a optimalizace služeb.',
            },
            {
              type: 'p',
              text: 'Právním základem je váš souhlas. Souhlas můžete kdykoliv odvolat nebo změnit prostřednictvím nastavení cookies.',
            },
          ],
        },
        {
          number: '4.9',
          title: 'Přímý marketing a obchodní sdělení',
          blocks: [
            {
              type: 'p',
              text: 'V přiměřeném rozsahu můžeme zpracovávat kontaktní údaje zákazníků za účelem zasílání obchodních sdělení týkajících se vlastních obdobných služeb. V ostatních případech zasíláme obchodní sdělení pouze na základě souhlasu.',
            },
            {
              type: 'p',
              text: 'Právním základem může být oprávněný zájem správce na komunikaci se stávajícími zákazníky, případně souhlas adresáta, pokud je vyžadován právními předpisy.',
            },
            {
              type: 'p',
              text: 'Adresát má vždy možnost zasílání obchodních sdělení odmítnout nebo se z jejich odběru odhlásit.',
            },
          ],
        },
        {
          number: '4.10',
          title: 'Ochrana právních nároků',
          blocks: [
            {
              type: 'p',
              text: 'Osobní údaje můžeme v nezbytném rozsahu zpracovávat také za účelem ochrany našich práv, řešení sporů, uplatnění nebo obrany právních nároků, kontroly plnění smluvních podmínek a prokazování splnění zákonných nebo smluvních povinností.',
            },
            {
              type: 'p',
              text: 'Právním základem je oprávněný zájem správce na ochraně jeho práv a právních nároků.',
            },
          ],
        },
      ],
    },
    {
      number: '5',
      title: 'Zpracování údajů v rámci webové aplikace Auditready',
      blocks: [
        {
          type: 'p',
          text: 'Webová aplikace Auditready slouží k řízenému vyplnění online checklistu, doplnění poznámek a podkladů zákazníkem a vytvoření výstupního reportu. V rámci používání aplikace dochází ke zpracování údajů, které uživatel do aplikace zadá, nahraje nebo které vzniknou při používání služby.',
        },
        {
          number: '5.1',
          title: 'Uživatelský účet a přístup do aplikace',
          blocks: [
            {
              type: 'p',
              text: 'Pro používání webové aplikace může být vyžadováno vytvoření uživatelského účtu. V rámci účtu zpracováváme zejména identifikační a kontaktní údaje uživatele, přihlašovací údaje, informace o organizaci, ke které je uživatel přiřazen, a údaje o oprávněních uživatele v aplikaci.',
            },
            {
              type: 'p',
              text: 'Tyto údaje slouží k ověření uživatele, správě přístupových oprávnění, zabezpečení účtu a umožnění používání zakoupené služby. Přístup do aplikace může být chráněn dalšími bezpečnostními prvky, například vícefaktorovým ověřením.',
            },
          ],
        },
        {
          number: '5.2',
          title: 'Vyplnění online checklistu',
          blocks: [
            {
              type: 'p',
              text: 'V rámci online checklistu uživatel zadává odpovědi na otázky týkající se připravenosti organizace v oblasti kybernetické bezpečnosti, souladu s vybranými požadavky nebo interními bezpečnostními opatřeními.',
            },
            {
              type: 'p',
              text: 'Zadané odpovědi mohou obsahovat informace o organizaci, jejích procesech, bezpečnostních opatřeních, technické infrastruktuře, dokumentaci, odpovědnostech a dalších skutečnostech důležitých pro vytvoření výstupního reportu.',
            },
          ],
        },
        {
          number: '5.3',
          title: 'Poznámky, komentáře a doplňující informace',
          blocks: [
            {
              type: 'p',
              text: 'Uživatel může v aplikaci doplňovat vlastní poznámky, komentáře nebo vysvětlení k jednotlivým otázkám. Tyto informace slouží k přesnějšímu posouzení odpovědí a k vytvoření relevantnějšího výstupního reportu.',
            },
            {
              type: 'p',
              text: 'Uživatel by měl do poznámek vkládat pouze informace nezbytné pro účel použití služby a neměl by vkládat nadbytečné osobní údaje, citlivé informace, hesla, přístupové tokeny, privátní klíče ani jiné údaje, které nejsou pro poskytnutí služby potřebné.',
            },
          ],
        },
        {
          number: '5.4',
          title: 'Nahrávání podkladů a důkazních souborů',
          blocks: [
            {
              type: 'p',
              text: 'Aplikace může umožňovat nahrání dokumentů, screenshotů, exportů, interních podkladů nebo jiných souborů, které slouží jako podpůrné informace k vyplněnému checklistu.',
            },
            {
              type: 'p',
              text: 'Zákazník odpovídá za obsah nahraných souborů a za to, že je oprávněn tyto soubory do aplikace vložit. Zákazník by měl před nahráním souborů zvážit, zda dokumenty neobsahují nadbytečné osobní údaje, důvěrné informace, obchodní tajemství nebo bezpečnostně citlivé údaje, které nejsou pro účel služby nezbytné.',
            },
            {
              type: 'p',
              text: 'Do aplikace by neměla být vkládána zejména hesla, autentizační údaje, privátní kryptografické klíče, přístupové tokeny, úplné bezpečnostní konfigurace, které nejsou nezbytné pro posouzení, ani jiné údaje, jejichž vložení by mohlo zvýšit bezpečnostní riziko pro zákazníka nebo třetí osoby.',
            },
          ],
        },
        {
          number: '5.5',
          title: 'Vytvoření výstupního reportu',
          blocks: [
            {
              type: 'p',
              text: 'Na základě údajů zadaných uživatelem může aplikace vytvořit výstupní report. Report může obsahovat shrnutí odpovědí, identifikované nedostatky, doporučení, doplňující komentáře a další informace odvozené ze zadaných údajů.',
            },
            {
              type: 'p',
              text: 'Výstupní report je vytvořen na základě údajů poskytnutých uživatelem. Společnost AuditReady s.r.o. neodpovídá za správnost nebo úplnost údajů, které do aplikace vloží zákazník nebo uživatel.',
            },
          ],
        },
        {
          number: '5.6',
          title: 'Automatické mazání údajů z aplikace',
          blocks: [
            {
              type: 'p',
              text: 'Údaje vložené do webové aplikace, zejména odpovědi v checklistu, poznámky, nahrané podklady a vygenerované reporty, mohou být uchovávány pouze po omezenou dobu nezbytnou pro poskytnutí služby.',
            },
            {
              type: 'p',
              text: 'Pokud je v rámci služby nastaveno automatické mazání údajů, budou příslušné údaje odstraněny ve lhůtě uvedené v těchto zásadách nebo v obchodních podmínkách služby. Po odstranění údajů již nemusí být možné znovu získat nahrané podklady ani vygenerovaný report.',
            },
            {
              type: 'p',
              text: 'Konkrétní doba uchování údajů je uvedena v kapitole věnované době uchování osobních údajů.',
            },
          ],
        },
        {
          number: '5.7',
          title: 'Odpovědnost zákazníka za vložené údaje',
          blocks: [
            {
              type: 'p',
              text: 'Zákazník odpovídá za to, že údaje, dokumenty a podklady vložené do aplikace jsou pravdivé, aktuální, přiměřené a že jejich vložením do aplikace neporušuje práva třetích osob ani své právní nebo smluvní povinnosti.',
            },
            {
              type: 'p',
              text: 'Pokud zákazník do aplikace vloží osobní údaje třetích osob, odpovídá za to, že má pro takové zpracování odpovídající právní základ a že tyto osoby byly v potřebném rozsahu informovány o zpracování jejich osobních údajů.',
            },
          ],
        },
      ],
    },
    {
      number: '6',
      title: 'Platební a fakturační údaje',
      blocks: [
        {
          type: 'p',
          text: 'V souvislosti s objednávkou, úhradou a fakturací služeb Auditready zpracováváme osobní a identifikační údaje nezbytné pro uzavření a plnění smlouvy, zpracování platby, vystavení daňového dokladu a splnění účetních a daňových povinností.',
        },
        {
          type: 'p',
          text: 'Zpracovávané údaje mohou zahrnovat zejména název zákazníka, jméno a příjmení kontaktní osoby, e-mailovou adresu, fakturační adresu, IČO, DIČ, údaje o objednané službě, cenu, stav platby, datum platby, identifikátor objednávky, identifikátor platby nebo transakce a další údaje nezbytné pro evidenci objednávky a vystavení účetního nebo daňového dokladu.',
        },
        {
          type: 'p',
          text: 'Platby za služby mohou být zpracovávány prostřednictvím externího poskytovatele platebních služeb, zejména prostřednictvím společnosti Stripe Payments Europe, Ltd. Pokud je platba prováděna platební kartou nebo jinou online platební metodou, údaje o platební kartě nezpracovává přímo společnost AuditReady s.r.o., ale příslušný poskytovatel platebních služeb podle svých vlastních podmínek a zásad ochrany osobních údajů.',
        },
        {
          type: 'p',
          text: 'Společnost AuditReady s.r.o. může od poskytovatele platebních služeb obdržet informace nezbytné pro potvrzení platby a správu objednávky, například stav platby, identifikátor transakce, částku, měnu, datum platby a informaci o úspěšném nebo neúspěšném provedení platby.',
        },
        {
          type: 'p',
          text: 'Fakturační a účetní údaje mohou být dále zpracovávány účetním nebo daňovým poradcem, případně v účetním nebo fakturačním systému, a to v rozsahu nezbytném pro splnění právních povinností společnosti AuditReady s.r.o.',
        },
        {
          type: 'p',
          text: 'Právním základem zpracování platebních a fakturačních údajů je plnění smlouvy, plnění právních povinností v oblasti účetnictví a daní a v nezbytném rozsahu také oprávněný zájem správce na evidenci plateb, správě objednávek a ochraně právních nároků.',
        },
      ],
    },
    {
      number: '7',
      title: 'Cookies a obdobné technologie',
      blocks: [
        {
          type: 'p',
          text: 'Webové stránky a webová aplikace Auditready mohou používat cookies a obdobné technologie, například local storage nebo session storage, za účelem zajištění funkčnosti webu, zabezpečení služby, uložení uživatelských voleb, měření návštěvnosti a případně zlepšování obsahu a služeb.',
        },
        {
          type: 'p',
          text: 'Cookies jsou malé textové soubory ukládané do zařízení uživatele. Některé cookies jsou nezbytné pro správné fungování webu nebo aplikace, jiné mohou být používány pouze na základě souhlasu uživatele.',
        },
        {
          number: '7.1',
          title: 'Nezbytné cookies',
          blocks: [
            {
              type: 'p',
              text: 'Nezbytné cookies a obdobné technologie používáme zejména pro zajištění základního fungování webu a aplikace, zabezpečení služby, správu přihlášení, ochranu proti zneužití, uložení nastavení cookies a zajištění správného zobrazení obsahu.',
            },
            {
              type: 'p',
              text: 'Tyto cookies jsou nezbytné pro poskytování služby a nelze je prostřednictvím cookie lišty vypnout. Pro jejich použití není vyžadován souhlas uživatele.',
            },
          ],
        },
        {
          number: '7.2',
          title: 'Analytické cookies',
          blocks: [
            {
              type: 'p',
              text: 'Analytické cookies mohou být používány za účelem měření návštěvnosti webu, porozumění tomu, jak uživatelé web používají, vyhodnocení účinnosti obsahu a zlepšování webových stránek a služeb.',
            },
            {
              type: 'p',
              text: 'Analytické cookies používáme pouze v případě, že k tomu uživatel udělí souhlas prostřednictvím cookie lišty nebo jiného nástroje pro správu souhlasu. Uživatel může svůj souhlas kdykoliv změnit nebo odvolat.',
            },
          ],
        },
        {
          number: '7.3',
          title: 'Marketingové cookies',
          blocks: [
            {
              type: 'p',
              text: 'Marketingové cookies mohou být v budoucnu používány za účelem měření účinnosti marketingových kampaní, zobrazování relevantního obsahu nebo vyhodnocování konverzí.',
            },
            {
              type: 'p',
              text: 'Marketingové cookies používáme pouze na základě souhlasu uživatele. Pokud marketingové cookies nejsou v dané době používány, nemusí být v cookie liště aktivně nabízeny nebo mohou být uvedeny jako nepoužívaná kategorie.',
            },
          ],
        },
        {
          number: '7.4',
          title: 'Správa souhlasu s cookies',
          blocks: [
            {
              type: 'p',
              text: 'Při první návštěvě webových stránek může být uživateli zobrazena cookie lišta, která umožňuje přijmout všechny volitelné cookies, odmítnout všechny volitelné cookies nebo upravit nastavení jednotlivých kategorií cookies.',
            },
            {
              type: 'p',
              text: 'Uživatel může svůj souhlas s používáním volitelných cookies kdykoliv změnit nebo odvolat prostřednictvím odkazu „Nastavení cookies“, který je dostupný na webových stránkách.',
            },
            {
              type: 'p',
              text: 'Odmítnutí volitelných cookies nemá vliv na možnost používat webové stránky nebo službu, může však ovlivnit některé doplňkové funkce, měření návštěvnosti nebo personalizaci obsahu.',
            },
          ],
        },
        {
          number: '7.5',
          title: 'Podrobnější informace o cookies',
          blocks: [
            {
              type: 'p',
              text: 'Podrobnější informace o konkrétních používaných cookies, jejich účelu, poskytovateli a době uchování mohou být uvedeny v samostatných Zásadách používání cookies nebo v nastavení cookie lišty.',
            },
          ],
        },
      ],
    },
    {
      number: '8',
      title: 'Příjemci a zpracovatelé osobních údajů',
      blocks: [
        {
          type: 'p',
          text: 'Osobní údaje mohou být zpřístupněny pouze osobám a subjektům, které se podílejí na provozu webových stránek, webové aplikace, poskytování služeb Auditready, zpracování plateb, fakturaci, technické podpoře, bezpečnosti, účetnictví nebo plnění právních povinností.',
        },
        {
          type: 'p',
          text: 'Osobní údaje mohou být zpracovávány zejména těmito kategoriemi příjemců a zpracovatelů:',
        },
        {
          type: 'list',
          items: [
            'poskytovatelé hostingových, cloudových a infrastrukturních služeb,',
            'poskytovatelé databázových a úložných služeb,',
            'poskytovatelé e-mailových, komunikačních a kancelářských služeb,',
            'poskytovatelé platebních služeb, zejména Stripe Payments Europe, Ltd.,',
            'poskytovatelé fakturačních, účetních nebo daňových služeb,',
            'externí účetní nebo daňový poradce,',
            'dodavatelé vývoje, technické správy, údržby a podpory aplikace,',
            'poskytovatelé bezpečnostních, monitorovacích a logovacích služeb,',
            'poskytovatelé analytických nástrojů, pokud jsou používány a pokud k tomu uživatel udělil souhlas,',
            'orgány veřejné moci, pokud nám takovou povinnost ukládá právní předpis nebo oprávněný požadavek.',
          ],
        },
        {
          type: 'p',
          text: 'S osobními údaji pracují pouze osoby, které je potřebují pro plnění svých úkolů nebo smluvních povinností. Pokud osobní údaje zpracovává externí dodavatel jako zpracovatel, je zpracování upraveno smlouvou o zpracování osobních údajů nebo jiným odpovídajícím smluvním ujednáním.',
        },
        {
          type: 'p',
          text: 'Společnost AuditReady s.r.o. neprodává osobní údaje třetím stranám.',
        },
      ],
    },
    {
      number: '9',
      title: 'Předávání osobních údajů mimo EU/EHP',
      blocks: [
        {
          type: 'p',
          text: 'Osobní údaje zpracováváme primárně v rámci Evropské unie nebo Evropského hospodářského prostoru. Někteří naši dodavatelé nebo jejich subdodavatelé však mohou mít sídlo, infrastrukturu nebo podpůrné týmy také mimo EU/EHP.',
        },
        {
          type: 'p',
          text: 'Pokud by v souvislosti s poskytováním služeb Auditready docházelo k předávání osobních údajů do zemí mimo EU/EHP, probíhá takové předávání pouze za podmínek stanovených právními předpisy na ochranu osobních údajů. Zejména může jít o předání do země, pro kterou Evropská komise vydala rozhodnutí o odpovídající úrovni ochrany, nebo o předání na základě vhodných záruk, například standardních smluvních doložek.',
        },
        {
          type: 'p',
          text: 'Při výběru dodavatelů zohledňujeme, zda poskytují odpovídající právní, organizační a technická opatření pro ochranu osobních údajů. Pokud je to možné a přiměřené, preferujeme zpracování a ukládání údajů v rámci EU/EHP.',
        },
        {
          type: 'p',
          text: 'Podrobnější informace o konkrétních dodavatelích a případném předávání údajů mimo EU/EHP mohou být uvedeny v těchto zásadách, v nastavení služby nebo v dokumentaci příslušného poskytovatele.',
        },
      ],
    },
    {
      number: '10',
      title: 'Doba uchování osobních údajů',
      blocks: [
        {
          type: 'p',
          text: 'Osobní údaje uchováváme pouze po dobu nezbytnou pro splnění účelů, pro které byly shromážděny, a dále po dobu, kterou nám ukládají právní předpisy nebo která je nezbytná pro ochranu našich práv a právních nároků.',
        },
        { type: 'p', text: 'Konkrétní doba uchování se liší podle typu údajů a účelu jejich zpracování.' },
        {
          number: '10.1',
          title: 'Údaje z kontaktní komunikace',
          blocks: [
            {
              type: 'p',
              text: 'Údaje poskytnuté prostřednictvím kontaktního formuláře, e-mailu, telefonu nebo jiné komunikace uchováváme po dobu nezbytnou k vyřízení dotazu, navazující komunikaci a případnému doložení průběhu komunikace.',
            },
            {
              type: 'p',
              text: 'Pokud nedojde k uzavření smlouvy, mohou být tyto údaje uchovávány nejdéle po dobu 12 měsíců od poslední komunikace, pokud není v konkrétním případě nezbytná delší doba uchování z důvodu ochrany právních nároků.',
            },
          ],
        },
        {
          number: '10.2',
          title: 'Údaje zákazníků a uživatelských účtů',
          blocks: [
            {
              type: 'p',
              text: 'Údaje zákazníků a uživatelů webové aplikace uchováváme po dobu trvání uživatelského účtu nebo smluvního vztahu. Po ukončení smluvního vztahu nebo zrušení účtu mohou být některé údaje dále uchovávány v omezeném rozsahu, pokud je to nezbytné pro splnění právních povinností, řešení reklamací, ochranu právních nároků nebo doložení poskytnutí služby.',
            },
          ],
        },
        {
          number: '10.3',
          title: 'Údaje vložené do webové aplikace',
          blocks: [
            {
              type: 'p',
              text: 'Údaje vložené zákazníkem nebo uživatelem do webové aplikace, zejména odpovědi v checklistu, poznámky, komentáře, nahrané podklady a vygenerované reporty, uchováváme pouze po dobu nezbytnou pro poskytnutí služby.',
            },
            {
              type: 'p',
              text: 'Pokud je ve službě nastaveno automatické mazání údajů, budou tyto údaje odstraněny nejpozději do 48 hodin od vygenerování výstupního reportu, případně v jiné lhůtě uvedené u konkrétní služby nebo v obchodních podmínkách.',
            },
            {
              type: 'p',
              text: 'Po odstranění údajů již nemusí být možné obnovit nahrané podklady, odpovědi ani vygenerovaný report. Uživatel je proto odpovědný za včasné stažení a uložení výstupního reportu, pokud jej chce dále používat.',
            },
          ],
        },
        {
          number: '10.4',
          title: 'Platební, fakturační a účetní údaje',
          blocks: [
            {
              type: 'p',
              text: 'Platební, fakturační a účetní údaje uchováváme po dobu stanovenou právními předpisy v oblasti účetnictví, daní a souvisejících povinností. Tyto údaje mohou být uchovávány i po skončení smluvního vztahu, pokud je to nezbytné pro splnění zákonných povinností společnosti AuditReady s.r.o.',
            },
          ],
        },
        {
          number: '10.5',
          title: 'Technické, provozní a bezpečnostní údaje',
          blocks: [
            {
              type: 'p',
              text: 'Technické, provozní a bezpečnostní logy uchováváme po dobu nezbytnou pro zajištění bezpečnosti služby, řešení technických problémů, detekci zneužití, ochranu právních nároků a zajištění provozu webových stránek a aplikace.',
            },
            {
              type: 'p',
              text: 'Standardní doba uchování těchto údajů je zpravidla 6 měsíců, pokud není v odůvodněných případech nezbytná delší doba uchování, například při řešení bezpečnostního incidentu, podezření na zneužití služby nebo právního sporu.',
            },
          ],
        },
        {
          number: '10.6',
          title: 'Údaje zpracovávané na základě souhlasu',
          blocks: [
            {
              type: 'p',
              text: 'Údaje zpracovávané na základě souhlasu, například údaje z analytických nebo marketingových cookies, zpracováváme po dobu platnosti souhlasu nebo do jeho odvolání.',
            },
            {
              type: 'p',
              text: 'Konkrétní doby uchování jednotlivých cookies mohou být uvedeny v samostatných Zásadách používání cookies nebo v nastavení cookie lišty.',
            },
          ],
        },
        {
          number: '10.7',
          title: 'Delší uchování v odůvodněných případech',
          blocks: [
            {
              type: 'p',
              text: 'V některých případech mohou být osobní údaje uchovávány po delší dobu, pokud je to nezbytné pro splnění právních povinností, ochranu právních nároků, řešení sporu, kontrolu plnění smluvních podmínek nebo vyšetření bezpečnostního incidentu.',
            },
            {
              type: 'p',
              text: 'V takovém případě uchováváme údaje pouze v rozsahu nezbytném pro daný účel.',
            },
          ],
        },
      ],
    },
    {
      number: '11',
      title: 'Bezpečnost osobních údajů',
      blocks: [
        {
          type: 'p',
          text: 'Ochranu osobních údajů a dalších informací zpracovávaných v rámci služeb Auditready považujeme za důležitou součást poskytované služby. Přijímáme přiměřená technická a organizační opatření s cílem chránit osobní údaje před neoprávněným přístupem, ztrátou, zneužitím, neoprávněnou změnou, zveřejněním nebo zničením.',
        },
        {
          type: 'p',
          text: 'Bezpečnostní opatření mohou zahrnovat zejména řízení přístupových oprávnění, používání silného ověřování, šifrování přenosu dat, oddělení přístupů podle rolí, zabezpečení cloudové infrastruktury, zálohování vybraných provozních komponent, technické logování, monitoring provozu, pravidelnou aktualizaci systémů a omezení přístupu k osobním údajům pouze na osoby, které je potřebují pro plnění svých úkolů.',
        },
        {
          type: 'p',
          text: 'Přístup do webové aplikace může být chráněn vícefaktorovým ověřením nebo jinými bezpečnostními mechanismy. Uživatelé jsou povinni chránit své přístupové údaje, nesdílet je s jinými osobami a bez zbytečného odkladu nás informovat v případě podezření na jejich zneužití nebo neoprávněný přístup k účtu.',
        },
        {
          type: 'p',
          text: 'Při výběru dodavatelů a zpracovatelů zohledňujeme jejich schopnost zajistit odpovídající úroveň ochrany osobních údajů. S externími zpracovateli, kteří zpracovávají osobní údaje naším jménem, uzavíráme odpovídající smluvní ujednání.',
        },
        {
          type: 'p',
          text: 'Přestože přijímáme přiměřená bezpečnostní opatření, žádný způsob přenosu dat přes internet ani žádný způsob elektronického ukládání dat nelze považovat za zcela bezrizikový. Pokud dojde k bezpečnostnímu incidentu, který by mohl mít dopad na ochranu osobních údajů, budeme postupovat v souladu s platnými právními předpisy a přijmeme odpovídající opatření ke zmírnění možných následků.',
        },
      ],
    },
    {
      number: '12',
      title: 'Práva subjektů údajů',
      blocks: [
        {
          type: 'p',
          text: 'V souvislosti se zpracováním osobních údajů máte práva stanovená právními předpisy na ochranu osobních údajů. Tato práva můžete uplatnit vůči společnosti AuditReady s.r.o. prostřednictvím kontaktních údajů uvedených v těchto zásadách.',
        },
        {
          number: '12.1',
          title: 'Právo na přístup k osobním údajům',
          blocks: [
            {
              type: 'p',
              text: 'Máte právo získat potvrzení, zda zpracováváme vaše osobní údaje. Pokud je zpracováváme, máte právo získat přístup k těmto údajům a informace o tom, jakým způsobem jsou zpracovávány.',
            },
          ],
        },
        {
          number: '12.2',
          title: 'Právo na opravu',
          blocks: [
            {
              type: 'p',
              text: 'Máte právo požadovat opravu nepřesných osobních údajů, které se vás týkají. Pokud jsou vaše údaje neúplné, můžete požadovat jejich doplnění.',
            },
          ],
        },
        {
          number: '12.3',
          title: 'Právo na výmaz',
          blocks: [
            {
              type: 'p',
              text: 'Máte právo požadovat výmaz osobních údajů, pokud již nejsou potřebné pro účely, pro které byly zpracovány, pokud odvoláte souhlas a neexistuje jiný právní základ zpracování, pokud vznesete námitku proti zpracování nebo pokud jsou údaje zpracovávány protiprávně.',
            },
            {
              type: 'p',
              text: 'Právo na výmaz se neuplatní v případech, kdy je další uchování údajů nezbytné pro splnění právní povinnosti, ochranu právních nároků nebo jiný zákonný důvod.',
            },
          ],
        },
        {
          number: '12.4',
          title: 'Právo na omezení zpracování',
          blocks: [
            {
              type: 'p',
              text: 'Máte právo požadovat omezení zpracování osobních údajů, například pokud popíráte přesnost údajů, pokud je zpracování protiprávní, ale nechcete údaje vymazat, nebo pokud údaje potřebujete pro určení, výkon nebo obhajobu právních nároků.',
            },
          ],
        },
        {
          number: '12.5',
          title: 'Právo na přenositelnost údajů',
          blocks: [
            {
              type: 'p',
              text: 'Pokud je zpracování založeno na souhlasu nebo na plnění smlouvy a probíhá automatizovaně, máte právo získat osobní údaje, které jste nám poskytli, ve strukturovaném, běžně používaném a strojově čitelném formátu, případně požadovat jejich předání jinému správci, pokud je to technicky proveditelné.',
            },
          ],
        },
        {
          number: '12.6',
          title: 'Právo vznést námitku',
          blocks: [
            {
              type: 'p',
              text: 'Máte právo vznést námitku proti zpracování osobních údajů, které je založeno na oprávněném zájmu správce. V takovém případě nebudeme údaje dále zpracovávat, pokud neprokážeme závažné oprávněné důvody pro zpracování, které převažují nad vašimi právy a zájmy, nebo pokud údaje nejsou potřebné pro určení, výkon nebo obhajobu právních nároků.',
            },
            {
              type: 'p',
              text: 'Pokud zpracováváme osobní údaje pro účely přímého marketingu, máte právo vznést námitku kdykoliv. V takovém případě nebudou vaše údaje pro přímý marketing dále zpracovávány.',
            },
          ],
        },
        {
          number: '12.7',
          title: 'Právo odvolat souhlas',
          blocks: [
            {
              type: 'p',
              text: 'Pokud je zpracování založeno na vašem souhlasu, máte právo tento souhlas kdykoliv odvolat. Odvoláním souhlasu není dotčena zákonnost zpracování provedeného před jeho odvoláním.',
            },
            {
              type: 'p',
              text: 'Souhlas s používáním volitelných cookies můžete odvolat nebo změnit prostřednictvím nastavení cookies na webových stránkách.',
            },
          ],
        },
        {
          number: '12.8',
          title: 'Vyřízení žádosti',
          blocks: [
            {
              type: 'p',
              text: 'Vaši žádost vyřídíme bez zbytečného odkladu, nejpozději ve lhůtě stanovené právními předpisy. V případě potřeby vás můžeme požádat o ověření totožnosti, abychom zabránili neoprávněnému zpřístupnění osobních údajů jiné osobě.',
            },
          ],
        },
      ],
    },
    {
      number: '13',
      title: 'Právo podat stížnost u dozorového úřadu',
      blocks: [
        {
          type: 'p',
          text: 'Pokud se domníváte, že při zpracování vašich osobních údajů dochází k porušení právních předpisů na ochranu osobních údajů, máte právo podat stížnost u dozorového úřadu.',
        },
        { type: 'p', text: 'Dozorovým úřadem v České republice je:' },
        {
          type: 'p',
          text: 'Úřad pro ochranu osobních údajů, Pplk. Sochora 27, 170 00 Praha 7, Web: www.uoou.gov.cz',
        },
        {
          type: 'p',
          text: 'Tím není dotčeno vaše právo obrátit se přímo na společnost AuditReady s.r.o. prostřednictvím kontaktních údajů uvedených v těchto zásadách. Budeme se snažit případné dotazy nebo námitky vyřešit nejprve přímo s vámi.',
        },
      ],
    },
    {
      number: '14',
      title: 'Změny těchto zásad',
      blocks: [
        {
          type: 'p',
          text: 'Tyto zásady můžeme průběžně aktualizovat, zejména v případě změn našich služeb, používaných technologií, právních požadavků, zpracovatelských postupů nebo dodavatelů.',
        },
        {
          type: 'p',
          text: 'Aktuální znění zásad bude vždy dostupné na webových stránkách Auditready. Pokud dojde k podstatné změně způsobu zpracování osobních údajů, můžeme vás o takové změně informovat také jiným vhodným způsobem, například prostřednictvím e-mailu nebo oznámení ve webové aplikaci.',
        },
        {
          type: 'p',
          text: 'Změny těchto zásad nabývají účinnosti dnem jejich zveřejnění, pokud není uvedeno jinak.',
        },
      ],
    },
    {
      number: '15',
      title: 'Kontaktní údaje pro ochranu osobních údajů',
      blocks: [
        {
          type: 'p',
          text: 'V případě dotazů týkajících se zpracování osobních údajů, uplatnění vašich práv nebo jiných záležitostí souvisejících s ochranou osobních údajů nás můžete kontaktovat na níže uvedené adrese:',
        },
        {
          type: 'p',
          text: 'Společnost AuditReady s.r.o. nejmenovala pověřence pro ochranu osobních údajů, protože jí tato povinnost podle platných právních předpisů nevznikla.',
        },
      ],
    },
  ],
  contactBlock: {
    title: 'AuditReady s.r.o.',
    lines: [
      'Francouzská 312/100',
      'Vršovice, 101 00 Praha 10',
      'E-mail: info@auditready.cz',
    ],
  },
};

const en: PrivacyPolicyContent = {
  title: 'Privacy Policy / Personal Data Processing Policy',
  sections: [
    {
      number: '1',
      title: 'Identification of the data controller',
      blocks: [
        { type: 'p', text: 'The controller of personal data is:' },
        {
          type: 'p',
          text: 'AuditReady s.r.o., with its registered office at Francouzská 312/100, Vršovice, 101 00 Prague 10, Company ID (IČO) 06584128, registered in the Commercial Register kept by the Municipal Court in Prague, section C, file 284828, and as the controller we process your personal data.',
        },
      ],
    },
    {
      number: '2',
      title: 'Scope of this policy',
      blocks: [
        {
          type: 'p',
          text: 'This policy applies to the processing of personal data that occurs in connection with the operation of the Auditready website, the use of the Auditready web application and the provision of related services.',
        },
        { type: 'p', text: 'This policy applies in particular to the following persons:' },
        {
          type: 'list',
          items: [
            'visitors of the Auditready website,',
            'persons who contact us through the contact form, e-mail or another communication channel,',
            'prospects interested in our services,',
            'customers and their contact persons,',
            'users of the Auditready web application,',
            'persons whose data may be contained in materials, notes, answers or documents uploaded or entered by the customer.',
          ],
        },
        {
          type: 'p',
          text: 'This policy applies both to the processing of data during ordinary use of the website and to the processing of data within the user account, the online checklist, the evaluation of answers, the creation of the output report, billing, technical support and ensuring the security of the service.',
        },
        {
          type: 'p',
          text: 'If a customer uploads documents, notes or other materials containing personal data of third parties into the Auditready web application, the customer is responsible for ensuring that they are entitled to upload such data and that doing so does not violate the rights of the persons concerned or any other legal obligations.',
        },
        {
          type: 'p',
          text: 'This policy does not apply to websites, applications or services of third parties to which the Auditready website may link. The processing of personal data by such third parties is the responsibility of the respective operators of those services.',
        },
      ],
    },
    {
      number: '3',
      title: 'What personal data we process',
      blocks: [
        {
          type: 'p',
          text: 'In connection with the operation of the website, the web application and the provision of Auditready services, we may process various categories of personal data. The scope of the data processed depends on whether you are only a visitor of the website, contact us, create a user account, use our service or act as a customer contact person.',
        },
        {
          number: '3.1',
          title: 'Website visitor data',
          blocks: [
            {
              type: 'p',
              text: 'When you visit the Auditready website, we may process in particular technical data related to the use of the site, such as:',
            },
            {
              type: 'list',
              items: [
                'IP address,',
                'type of device, browser and operating system,',
                'date and time of the visit,',
                'pages visited,',
                'information about your behaviour on the website, if you give consent through the cookie banner,',
                'cookie settings and information about consent granted or refused.',
              ],
            },
            {
              type: 'p',
              text: 'This data is processed in particular to ensure the proper functioning of the website, its security, basic technical administration and, where applicable, traffic measurement, if the user consents to it.',
            },
          ],
        },
        {
          number: '3.2',
          title: 'Data of persons who contact us',
          blocks: [
            {
              type: 'p',
              text: 'If you contact us through the contact form, e-mail, telephone or any other communication channel, we may process in particular:',
            },
            {
              type: 'list',
              items: [
                'first name and last name,',
                'e-mail address,',
                'telephone number, if you provide it,',
                'organisation name,',
                'job position or role in the organisation, if you provide it,',
                'content of the message,',
                'other information that you communicate to us in the course of the communication.',
              ],
            },
            {
              type: 'p',
              text: 'We process this data in order to handle your enquiry, prepare an offer, communicate with the prospect or customer and conduct related business communication.',
            },
          ],
        },
        {
          number: '3.3',
          title: 'Data of customers and users of the web application',
          blocks: [
            {
              type: 'p',
              text: 'If you use the Auditready web application or related online services, we may process in particular:',
            },
            {
              type: 'list',
              items: [
                'first name and last name of the user,',
                'e-mail address,',
                'organisation name,',
                'company ID (IČO) and billing data of the organisation,',
                'role or permissions of the user within the application,',
                'login and identification data of the user account,',
                'data about the use of the service,',
                'history of orders, payments and generated outputs,',
                'communication with technical or customer support.',
              ],
            },
            {
              type: 'p',
              text: 'This data is necessary in particular for the creation and management of the user account, providing access to the purchased service, managing the customer relationship, billing and user support.',
            },
          ],
        },
        {
          number: '3.4',
          title: 'Data entered into the online checklist and related materials',
          blocks: [
            {
              type: 'p',
              text: 'When using the Auditready web application, the customer or user may enter answers, notes, documents or other materials related to the assessment of the organisation\u2019s readiness.',
            },
            { type: 'p', text: 'This data may include in particular:' },
            {
              type: 'list',
              items: [
                'answers to questions in the online checklist,',
                'notes and comments by the user,',
                'information about the organisation, its processes, technical and organisational measures,',
                'information about security documentation,',
                'uploaded files and supporting evidence,',
                'information contained in the generated output report.',
              ],
            },
            {
              type: 'p',
              text: 'In some cases, these materials may also contain personal data of third parties, such as names of employees, contact details, work roles or information contained in the customer\u2019s internal documents. The customer is responsible for ensuring that only such data is entered into the application as the customer is entitled to process and transfer to AuditReady s.r.o. for the purpose of providing the service.',
            },
          ],
        },
        {
          number: '3.5',
          title: 'Payment and billing data',
          blocks: [
            {
              type: 'p',
              text: 'In connection with ordering and paying for the service, we may process in particular:',
            },
            {
              type: 'list',
              items: [
                'identification and billing data of the customer,',
                'organisation name,',
                'company ID (IČO) and VAT ID (DIČ), where relevant,',
                'billing address,',
                'contact e-mail for sending invoices,',
                'data about the ordered service,',
                'payment status,',
                'payment or transaction identifier,',
                'data necessary for issuing and keeping accounting and tax documents.',
              ],
            },
            {
              type: 'p',
              text: 'We do not process payment card data directly if the payment is made through an external payment service provider. In such a case, the payment data is processed directly by that provider in accordance with its own rules and terms.',
            },
          ],
        },
        {
          number: '3.6',
          title: 'Technical, operational and security data',
          blocks: [
            {
              type: 'p',
              text: 'In order to ensure the security, availability and proper operation of the website and the web application, we may also process technical, operational and security data, such as:',
            },
            {
              type: 'list',
              items: [
                'IP address,',
                'time of login and logout,',
                'records of access to the user account,',
                'information about actions performed within the application,',
                'technical logs,',
                'information about application errors,',
                'data necessary to prevent misuse of the service, unauthorised access or security incidents.',
              ],
            },
            {
              type: 'p',
              text: 'We process this data in particular to protect user accounts, protect customer data, detect technical problems, ensure operation of the service and protect the rights and legitimate interests of AuditReady s.r.o.',
            },
          ],
        },
      ],
    },
    {
      number: '4',
      title: 'Purposes and legal bases of processing',
      blocks: [
        {
          type: 'p',
          text: 'We process personal data only to the extent necessary for the specific purposes set out below. For each purpose of processing, we assign a corresponding legal basis under the General Data Protection Regulation (GDPR).',
        },
        {
          number: '4.1',
          title: 'Operation of the website and ensuring its functionality',
          blocks: [
            {
              type: 'p',
              text: 'We process personal and technical data of website visitors in order to ensure the proper functioning of the website, its security, availability, basic technical administration and display of content.',
            },
            {
              type: 'p',
              text: 'The legal basis for this processing is the controller\u2019s legitimate interest in operating, administering and securing the website. For strictly necessary cookies, the processing is necessary to ensure the functionality of the website.',
            },
          ],
        },
        {
          number: '4.2',
          title: 'Communication with prospects, customers and other persons',
          blocks: [
            {
              type: 'p',
              text: 'If you contact us through e-mail, the contact form, telephone or another communication channel, we process the data provided in order to handle your enquiry, reply to your message, prepare an offer, negotiate the terms of cooperation or conduct follow-up business communication.',
            },
            {
              type: 'p',
              text: 'Depending on the nature of the communication, the legal basis is the implementation of pre-contractual measures, the performance of a contract or the controller\u2019s legitimate interest in conducting business communication and handling enquiries.',
            },
          ],
        },
        {
          number: '4.3',
          title: 'Creation and management of the user account',
          blocks: [
            {
              type: 'p',
              text: 'We process personal data of web application users in order to create, manage and secure the user account, verify the user\u2019s identity, set permissions, manage access and enable the use of the purchased service.',
            },
            {
              type: 'p',
              text: 'The legal basis is the performance of a contract or, where applicable, the implementation of pre-contractual measures. For security measures, the legal basis may also be the controller\u2019s legitimate interest in protecting the service, user accounts and customer data.',
            },
          ],
        },
        {
          number: '4.4',
          title: 'Provision of the Auditready service and creation of the output report',
          blocks: [
            {
              type: 'p',
              text: 'We process data entered into the web application, in particular checklist answers, notes, comments, information about the organisation and, where applicable, uploaded materials, in order to provide the Auditready service, evaluate the answers entered and generate the output report.',
            },
            {
              type: 'p',
              text: 'The legal basis is the performance of the contract between the customer and AuditReady s.r.o. If the customer enters personal data of third parties into the application, the customer is responsible for having an appropriate legal basis for entering and processing such data.',
            },
          ],
        },
        {
          number: '4.5',
          title: 'Billing, accounting and compliance with legal obligations',
          blocks: [
            {
              type: 'p',
              text: 'We process identification, billing and payment data in order to process the order, receive payment for the service, issue tax and accounting documents, maintain accounting records and comply with other legal obligations.',
            },
            {
              type: 'p',
              text: 'The legal basis is the performance of the contract and compliance with legal obligations applicable to the controller, in particular in the area of accounting and taxes.',
            },
          ],
        },
        {
          number: '4.6',
          title: 'Technical support and handling of user requests',
          blocks: [
            {
              type: 'p',
              text: 'We process data provided through communication with technical or customer support in order to handle user requests, technical issues, complaints, enquiries and to ensure the proper operation of the service.',
            },
            {
              type: 'p',
              text: 'The legal basis is the performance of a contract or, where applicable, the controller\u2019s legitimate interest in providing support, resolving issues and improving the service.',
            },
          ],
        },
        {
          number: '4.7',
          title: 'Service security, account protection and prevention of misuse',
          blocks: [
            {
              type: 'p',
              text: 'We process technical, operational and security data in order to protect the website, web application, user accounts, customer data and infrastructure. This data may be used in particular to detect errors, unauthorised access, suspicious activity, security incidents or other misuse of the service.',
            },
            {
              type: 'p',
              text: 'The legal basis is the controller\u2019s legitimate interest in protecting the service, customers, data, infrastructure and legal claims.',
            },
          ],
        },
        {
          number: '4.8',
          title: 'Web analytics and service improvement',
          blocks: [
            {
              type: 'p',
              text: 'If you give consent through the cookie banner or another similar tool, we may process data about the use of the website in order to measure traffic, evaluate the effectiveness of content, improve the website and optimise our services.',
            },
            {
              type: 'p',
              text: 'The legal basis is your consent. You can withdraw or change your consent at any time through the cookie settings.',
            },
          ],
        },
        {
          number: '4.9',
          title: 'Direct marketing and commercial communications',
          blocks: [
            {
              type: 'p',
              text: 'To a reasonable extent, we may process contact data of customers in order to send commercial communications relating to our own similar services. In other cases, we send commercial communications only on the basis of consent.',
            },
            {
              type: 'p',
              text: 'The legal basis may be the controller\u2019s legitimate interest in communicating with existing customers or the consent of the recipient, where required by law.',
            },
            {
              type: 'p',
              text: 'The recipient always has the right to refuse or unsubscribe from commercial communications.',
            },
          ],
        },
        {
          number: '4.10',
          title: 'Protection of legal claims',
          blocks: [
            {
              type: 'p',
              text: 'We may also process personal data, to the extent necessary, in order to protect our rights, resolve disputes, assert or defend legal claims, monitor compliance with contractual terms and demonstrate fulfilment of statutory or contractual obligations.',
            },
            {
              type: 'p',
              text: 'The legal basis is the controller\u2019s legitimate interest in protecting its rights and legal claims.',
            },
          ],
        },
      ],
    },
    {
      number: '5',
      title: 'Data processing within the Auditready web application',
      blocks: [
        {
          type: 'p',
          text: 'The Auditready web application is used for guided completion of an online checklist, addition of notes and supporting materials by the customer and creation of an output report. During the use of the application, data entered, uploaded or generated by the user during the use of the service is processed.',
        },
        {
          number: '5.1',
          title: 'User account and access to the application',
          blocks: [
            {
              type: 'p',
              text: 'Use of the web application may require the creation of a user account. Within the account, we process in particular the user\u2019s identification and contact data, login credentials, information about the organisation to which the user is assigned and data on the user\u2019s permissions within the application.',
            },
            {
              type: 'p',
              text: 'This data is used to authenticate the user, manage access permissions, secure the account and enable the use of the purchased service. Access to the application may be protected by additional security mechanisms, for example multi-factor authentication.',
            },
          ],
        },
        {
          number: '5.2',
          title: 'Completing the online checklist',
          blocks: [
            {
              type: 'p',
              text: 'Within the online checklist, the user provides answers to questions concerning the readiness of the organisation in the area of cyber security, compliance with selected requirements or internal security measures.',
            },
            {
              type: 'p',
              text: 'The answers provided may contain information about the organisation, its processes, security measures, technical infrastructure, documentation, responsibilities and other matters relevant to the creation of the output report.',
            },
          ],
        },
        {
          number: '5.3',
          title: 'Notes, comments and additional information',
          blocks: [
            {
              type: 'p',
              text: 'The user may add their own notes, comments or explanations to individual questions in the application. This information serves to enable a more accurate assessment of the answers and the creation of a more relevant output report.',
            },
            {
              type: 'p',
              text: 'The user should include in the notes only information that is necessary for the purpose of using the service and should not enter excessive personal data, sensitive information, passwords, access tokens, private keys or other data that is not necessary for the provision of the service.',
            },
          ],
        },
        {
          number: '5.4',
          title: 'Uploading materials and supporting files',
          blocks: [
            {
              type: 'p',
              text: 'The application may allow the upload of documents, screenshots, exports, internal materials or other files that serve as supporting information for the completed checklist.',
            },
            {
              type: 'p',
              text: 'The customer is responsible for the content of uploaded files and for being entitled to upload them to the application. Before uploading files, the customer should consider whether the documents contain excessive personal data, confidential information, trade secrets or security-sensitive data that is not necessary for the purpose of the service.',
            },
            {
              type: 'p',
              text: 'In particular, passwords, authentication data, private cryptographic keys, access tokens, complete security configurations that are not necessary for the assessment, or other data whose upload could increase security risk for the customer or third parties should not be uploaded to the application.',
            },
          ],
        },
        {
          number: '5.5',
          title: 'Creation of the output report',
          blocks: [
            {
              type: 'p',
              text: 'Based on the data entered by the user, the application may generate an output report. The report may contain a summary of answers, identified gaps, recommendations, additional comments and other information derived from the data entered.',
            },
            {
              type: 'p',
              text: 'The output report is generated on the basis of data provided by the user. AuditReady s.r.o. is not responsible for the correctness or completeness of the data entered into the application by the customer or user.',
            },
          ],
        },
        {
          number: '5.6',
          title: 'Automatic deletion of data from the application',
          blocks: [
            {
              type: 'p',
              text: 'Data entered into the web application, in particular checklist answers, notes, uploaded materials and generated reports, may be retained only for a limited time necessary for the provision of the service.',
            },
            {
              type: 'p',
              text: 'If automatic data deletion is configured within the service, the relevant data will be deleted within the period stated in this policy or in the terms of service. After the data has been deleted, it may no longer be possible to retrieve the uploaded materials or the generated report.',
            },
            {
              type: 'p',
              text: 'The specific retention period is set out in the section dedicated to retention of personal data.',
            },
          ],
        },
        {
          number: '5.7',
          title: 'Customer\u2019s responsibility for the data uploaded',
          blocks: [
            {
              type: 'p',
              text: 'The customer is responsible for ensuring that the data, documents and materials uploaded to the application are accurate, up to date, appropriate and that their upload to the application does not infringe the rights of third parties or any of the customer\u2019s legal or contractual obligations.',
            },
            {
              type: 'p',
              text: 'If the customer uploads personal data of third parties into the application, the customer is responsible for having an appropriate legal basis for such processing and for ensuring that those persons have been informed to the necessary extent about the processing of their personal data.',
            },
          ],
        },
      ],
    },
    {
      number: '6',
      title: 'Payment and billing data',
      blocks: [
        {
          type: 'p',
          text: 'In connection with ordering, paying for and billing Auditready services, we process personal and identification data necessary for the conclusion and performance of the contract, processing of the payment, issuance of the tax document and compliance with accounting and tax obligations.',
        },
        {
          type: 'p',
          text: 'The data processed may include in particular the customer\u2019s name, the first name and last name of the contact person, e-mail address, billing address, company ID (IČO), VAT ID (DIČ), information about the ordered service, price, payment status, payment date, order identifier, payment or transaction identifier and other data necessary for the registration of the order and the issuance of the accounting or tax document.',
        },
        {
          type: 'p',
          text: 'Payments for services may be processed through an external payment service provider, in particular through Stripe Payments Europe, Ltd. If a payment is made by payment card or any other online payment method, payment card data is not processed directly by AuditReady s.r.o. but by the relevant payment service provider in accordance with its own terms and privacy policy.',
        },
        {
          type: 'p',
          text: 'AuditReady s.r.o. may receive from the payment service provider information necessary to confirm the payment and manage the order, such as payment status, transaction identifier, amount, currency, payment date and information about the success or failure of the payment.',
        },
        {
          type: 'p',
          text: 'Billing and accounting data may also be processed by an accounting or tax advisor or within an accounting or invoicing system, to the extent necessary for compliance with the legal obligations of AuditReady s.r.o.',
        },
        {
          type: 'p',
          text: 'The legal basis for the processing of payment and billing data is the performance of the contract, compliance with legal obligations in the area of accounting and taxes and, to the extent necessary, also the controller\u2019s legitimate interest in keeping records of payments, managing orders and protecting legal claims.',
        },
      ],
    },
    {
      number: '7',
      title: 'Cookies and similar technologies',
      blocks: [
        {
          type: 'p',
          text: 'The Auditready website and web application may use cookies and similar technologies, such as local storage or session storage, to ensure the functionality of the website, secure the service, store user preferences, measure traffic and, where applicable, improve content and services.',
        },
        {
          type: 'p',
          text: 'Cookies are small text files stored on the user\u2019s device. Some cookies are necessary for the proper functioning of the website or application; others may be used only with the user\u2019s consent.',
        },
        {
          number: '7.1',
          title: 'Necessary cookies',
          blocks: [
            {
              type: 'p',
              text: 'We use necessary cookies and similar technologies in particular to ensure the basic functioning of the website and application, secure the service, manage logins, protect against abuse, store cookie settings and ensure the proper display of content.',
            },
            {
              type: 'p',
              text: 'These cookies are necessary for the provision of the service and cannot be disabled through the cookie banner. No user consent is required for their use.',
            },
          ],
        },
        {
          number: '7.2',
          title: 'Analytics cookies',
          blocks: [
            {
              type: 'p',
              text: 'Analytics cookies may be used to measure website traffic, understand how users interact with the website, evaluate the effectiveness of content and improve the website and services.',
            },
            {
              type: 'p',
              text: 'We use analytics cookies only if the user grants consent through the cookie banner or another consent management tool. The user can change or withdraw their consent at any time.',
            },
          ],
        },
        {
          number: '7.3',
          title: 'Marketing cookies',
          blocks: [
            {
              type: 'p',
              text: 'Marketing cookies may be used in the future to measure the effectiveness of marketing campaigns, display relevant content or evaluate conversions.',
            },
            {
              type: 'p',
              text: 'We use marketing cookies only with the user\u2019s consent. If marketing cookies are not currently in use, they may not be actively offered in the cookie banner or may be listed as an unused category.',
            },
          ],
        },
        {
          number: '7.4',
          title: 'Cookie consent management',
          blocks: [
            {
              type: 'p',
              text: 'On the first visit to the website, the user may be shown a cookie banner that allows them to accept all optional cookies, reject all optional cookies or adjust the settings of individual cookie categories.',
            },
            {
              type: 'p',
              text: 'The user can change or withdraw their consent to the use of optional cookies at any time via the "Cookie settings" link available on the website.',
            },
            {
              type: 'p',
              text: 'Rejecting optional cookies does not affect the ability to use the website or service, but it may affect some additional features, traffic measurement or content personalisation.',
            },
          ],
        },
        {
          number: '7.5',
          title: 'More information about cookies',
          blocks: [
            {
              type: 'p',
              text: 'More detailed information about the specific cookies used, their purpose, provider and retention period may be set out in a separate Cookie Policy or in the cookie banner settings.',
            },
          ],
        },
      ],
    },
    {
      number: '8',
      title: 'Recipients and processors of personal data',
      blocks: [
        {
          type: 'p',
          text: 'Personal data may only be made available to persons and entities involved in the operation of the website, the web application, the provision of Auditready services, payment processing, billing, technical support, security, accounting or compliance with legal obligations.',
        },
        {
          type: 'p',
          text: 'Personal data may be processed in particular by the following categories of recipients and processors:',
        },
        {
          type: 'list',
          items: [
            'providers of hosting, cloud and infrastructure services,',
            'providers of database and storage services,',
            'providers of e-mail, communication and office services,',
            'payment service providers, in particular Stripe Payments Europe, Ltd.,',
            'providers of billing, accounting or tax services,',
            'external accounting or tax advisors,',
            'suppliers of development, technical administration, maintenance and support of the application,',
            'providers of security, monitoring and logging services,',
            'providers of analytics tools, where used and where the user has given consent,',
            'public authorities, where such obligation is imposed on us by law or a legitimate request.',
          ],
        },
        {
          type: 'p',
          text: 'Personal data is only handled by persons who need it for the performance of their tasks or contractual obligations. If personal data is processed by an external supplier acting as a processor, the processing is governed by a data processing agreement or another equivalent contractual arrangement.',
        },
        {
          type: 'p',
          text: 'AuditReady s.r.o. does not sell personal data to third parties.',
        },
      ],
    },
    {
      number: '9',
      title: 'Transfers of personal data outside the EU/EEA',
      blocks: [
        {
          type: 'p',
          text: 'We process personal data primarily within the European Union or the European Economic Area. However, some of our suppliers or their sub-suppliers may have their registered offices, infrastructure or support teams also outside the EU/EEA.',
        },
        {
          type: 'p',
          text: 'If, in connection with the provision of Auditready services, personal data were to be transferred to countries outside the EU/EEA, such transfer would take place only under the conditions laid down by data protection legislation. In particular, this may concern transfers to a country for which the European Commission has issued an adequacy decision, or transfers on the basis of appropriate safeguards, such as standard contractual clauses.',
        },
        {
          type: 'p',
          text: 'When selecting suppliers, we take into account whether they provide adequate legal, organisational and technical measures for the protection of personal data. Where possible and appropriate, we prefer to process and store data within the EU/EEA.',
        },
        {
          type: 'p',
          text: 'More detailed information about specific suppliers and any transfers of data outside the EU/EEA may be set out in this policy, in the service settings or in the documentation of the relevant provider.',
        },
      ],
    },
    {
      number: '10',
      title: 'Retention period of personal data',
      blocks: [
        {
          type: 'p',
          text: 'We retain personal data only for the time necessary to fulfil the purposes for which it was collected, and further for the period required by law or necessary for the protection of our rights and legal claims.',
        },
        {
          type: 'p',
          text: 'The specific retention period varies depending on the type of data and the purpose of its processing.',
        },
        {
          number: '10.1',
          title: 'Data from contact communication',
          blocks: [
            {
              type: 'p',
              text: 'Data provided through the contact form, e-mail, telephone or other communication is retained for the time necessary to handle the enquiry, conduct follow-up communication and, where appropriate, to document the course of the communication.',
            },
            {
              type: 'p',
              text: 'If no contract is concluded, such data may be retained for up to 12 months from the last communication, unless a longer retention period is necessary in a specific case for the protection of legal claims.',
            },
          ],
        },
        {
          number: '10.2',
          title: 'Customer and user account data',
          blocks: [
            {
              type: 'p',
              text: 'We retain data of customers and users of the web application for the duration of the user account or the contractual relationship. After termination of the contractual relationship or deletion of the account, some data may be retained to a limited extent if necessary for compliance with legal obligations, handling of complaints, protection of legal claims or evidence of provision of the service.',
            },
          ],
        },
        {
          number: '10.3',
          title: 'Data entered into the web application',
          blocks: [
            {
              type: 'p',
              text: 'Data entered by the customer or user into the web application, in particular checklist answers, notes, comments, uploaded materials and generated reports, is retained only for the time necessary for the provision of the service.',
            },
            {
              type: 'p',
              text: 'If automatic data deletion is configured for the service, such data will be deleted no later than 48 hours after the output report has been generated, or within another period specified for the specific service or in the terms of service.',
            },
            {
              type: 'p',
              text: 'After the data has been deleted, it may no longer be possible to restore the uploaded materials, answers or generated report. The user is therefore responsible for downloading and saving the output report in time if they wish to use it further.',
            },
          ],
        },
        {
          number: '10.4',
          title: 'Payment, billing and accounting data',
          blocks: [
            {
              type: 'p',
              text: 'We retain payment, billing and accounting data for the period required by accounting, tax and related legislation. This data may be retained even after the end of the contractual relationship if necessary to fulfil the legal obligations of AuditReady s.r.o.',
            },
          ],
        },
        {
          number: '10.5',
          title: 'Technical, operational and security data',
          blocks: [
            {
              type: 'p',
              text: 'We retain technical, operational and security logs for the time necessary to ensure the security of the service, resolve technical issues, detect misuse, protect legal claims and ensure the operation of the website and application.',
            },
            {
              type: 'p',
              text: 'The standard retention period for such data is typically 6 months, unless a longer retention period is necessary in justified cases, for example when handling a security incident, suspected misuse of the service or a legal dispute.',
            },
          ],
        },
        {
          number: '10.6',
          title: 'Data processed on the basis of consent',
          blocks: [
            {
              type: 'p',
              text: 'Data processed on the basis of consent, such as data from analytics or marketing cookies, is processed for the duration of the consent or until it is withdrawn.',
            },
            {
              type: 'p',
              text: 'Specific retention periods of individual cookies may be set out in a separate Cookie Policy or in the cookie banner settings.',
            },
          ],
        },
        {
          number: '10.7',
          title: 'Longer retention in justified cases',
          blocks: [
            {
              type: 'p',
              text: 'In certain cases, personal data may be retained for a longer period if necessary for compliance with legal obligations, protection of legal claims, resolution of a dispute, monitoring of compliance with contractual terms or investigation of a security incident.',
            },
            {
              type: 'p',
              text: 'In such a case, we retain the data only to the extent necessary for the given purpose.',
            },
          ],
        },
      ],
    },
    {
      number: '11',
      title: 'Security of personal data',
      blocks: [
        {
          type: 'p',
          text: 'We consider the protection of personal data and other information processed within Auditready services to be an important part of the service provided. We take appropriate technical and organisational measures to protect personal data against unauthorised access, loss, misuse, unauthorised alteration, disclosure or destruction.',
        },
        {
          type: 'p',
          text: 'Security measures may include in particular access control, the use of strong authentication, encryption of data transmission, role-based separation of access, securing of cloud infrastructure, back-up of selected operational components, technical logging, monitoring of operations, regular updates of systems and restricting access to personal data only to persons who need it for the performance of their tasks.',
        },
        {
          type: 'p',
          text: 'Access to the web application may be protected by multi-factor authentication or other security mechanisms. Users are obliged to protect their login credentials, not to share them with others and to inform us without undue delay if they suspect misuse of their credentials or unauthorised access to their account.',
        },
        {
          type: 'p',
          text: 'When selecting suppliers and processors, we take into account their ability to ensure an adequate level of protection of personal data. We enter into appropriate contractual arrangements with external processors who process personal data on our behalf.',
        },
        {
          type: 'p',
          text: 'Although we take reasonable security measures, no method of transmitting data over the internet nor any method of electronic storage can be considered entirely risk-free. If a security incident occurs that could affect the protection of personal data, we will act in accordance with applicable law and take appropriate measures to mitigate possible consequences.',
        },
      ],
    },
    {
      number: '12',
      title: 'Rights of data subjects',
      blocks: [
        {
          type: 'p',
          text: 'In connection with the processing of personal data, you have the rights set out by data protection legislation. You can exercise these rights against AuditReady s.r.o. using the contact details set out in this policy.',
        },
        {
          number: '12.1',
          title: 'Right of access to personal data',
          blocks: [
            {
              type: 'p',
              text: 'You have the right to obtain confirmation as to whether we are processing your personal data. If we are processing it, you have the right to obtain access to such data and information on how it is being processed.',
            },
          ],
        },
        {
          number: '12.2',
          title: 'Right to rectification',
          blocks: [
            {
              type: 'p',
              text: 'You have the right to request the rectification of inaccurate personal data concerning you. If your data is incomplete, you may request its completion.',
            },
          ],
        },
        {
          number: '12.3',
          title: 'Right to erasure',
          blocks: [
            {
              type: 'p',
              text: 'You have the right to request the erasure of personal data if it is no longer necessary for the purposes for which it was processed, if you withdraw your consent and there is no other legal basis for the processing, if you object to the processing or if the data is being processed unlawfully.',
            },
            {
              type: 'p',
              text: 'The right to erasure does not apply where further retention of the data is necessary for compliance with a legal obligation, for the protection of legal claims or for another statutory reason.',
            },
          ],
        },
        {
          number: '12.4',
          title: 'Right to restriction of processing',
          blocks: [
            {
              type: 'p',
              text: 'You have the right to request the restriction of the processing of personal data, for example if you contest the accuracy of the data, if the processing is unlawful but you do not wish the data to be erased, or if you need the data for the establishment, exercise or defence of legal claims.',
            },
          ],
        },
        {
          number: '12.5',
          title: 'Right to data portability',
          blocks: [
            {
              type: 'p',
              text: 'If the processing is based on consent or on the performance of a contract and is carried out by automated means, you have the right to receive the personal data you have provided to us in a structured, commonly used and machine-readable format, and to request its transmission to another controller, where technically feasible.',
            },
          ],
        },
        {
          number: '12.6',
          title: 'Right to object',
          blocks: [
            {
              type: 'p',
              text: 'You have the right to object to the processing of personal data based on the controller\u2019s legitimate interest. In such a case, we will no longer process the data unless we demonstrate compelling legitimate grounds for the processing that override your rights and interests, or unless the data is necessary for the establishment, exercise or defence of legal claims.',
            },
            {
              type: 'p',
              text: 'If we process personal data for direct marketing purposes, you have the right to object at any time. In such a case, your data will no longer be processed for direct marketing.',
            },
          ],
        },
        {
          number: '12.7',
          title: 'Right to withdraw consent',
          blocks: [
            {
              type: 'p',
              text: 'If the processing is based on your consent, you have the right to withdraw such consent at any time. The withdrawal of consent does not affect the lawfulness of processing carried out before its withdrawal.',
            },
            {
              type: 'p',
              text: 'You can withdraw or change consent to the use of optional cookies through the cookie settings on the website.',
            },
          ],
        },
        {
          number: '12.8',
          title: 'Handling of requests',
          blocks: [
            {
              type: 'p',
              text: 'We will handle your request without undue delay and at the latest within the period stipulated by law. Where necessary, we may ask you to verify your identity in order to prevent unauthorised disclosure of personal data to another person.',
            },
          ],
        },
      ],
    },
    {
      number: '13',
      title: 'Right to lodge a complaint with the supervisory authority',
      blocks: [
        {
          type: 'p',
          text: 'If you believe that the processing of your personal data infringes data protection legislation, you have the right to lodge a complaint with the supervisory authority.',
        },
        { type: 'p', text: 'The supervisory authority in the Czech Republic is:' },
        {
          type: 'p',
          text: 'Office for Personal Data Protection (Úřad pro ochranu osobních údajů), Pplk. Sochora 27, 170 00 Prague 7, Web: www.uoou.gov.cz',
        },
        {
          type: 'p',
          text: 'This does not affect your right to contact AuditReady s.r.o. directly using the contact details set out in this policy. We will endeavour to resolve any questions or objections with you directly first.',
        },
      ],
    },
    {
      number: '14',
      title: 'Changes to this policy',
      blocks: [
        {
          type: 'p',
          text: 'We may update this policy from time to time, in particular in the event of changes to our services, the technologies used, legal requirements, processing practices or suppliers.',
        },
        {
          type: 'p',
          text: 'The current version of the policy will always be available on the Auditready website. If a significant change is made to the way personal data is processed, we may also inform you of such a change in another appropriate manner, for example by e-mail or a notice in the web application.',
        },
        {
          type: 'p',
          text: 'Changes to this policy take effect on the date of their publication, unless stated otherwise.',
        },
      ],
    },
    {
      number: '15',
      title: 'Contact details for personal data protection',
      blocks: [
        {
          type: 'p',
          text: 'If you have any questions regarding the processing of personal data, the exercise of your rights or other matters related to the protection of personal data, you can contact us at the address below:',
        },
        {
          type: 'p',
          text: 'AuditReady s.r.o. has not appointed a Data Protection Officer, as this obligation does not apply to it under the applicable legislation.',
        },
      ],
    },
  ],
  contactBlock: {
    title: 'AuditReady s.r.o.',
    lines: [
      'Francouzská 312/100',
      'Vršovice, 101 00 Prague 10',
      'E-mail: info@auditready.cz',
    ],
  },
};

export const privacyPolicyContent: Record<Locale, PrivacyPolicyContent> = {
  cs,
  en,
};
