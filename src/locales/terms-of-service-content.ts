import type { Locale } from '@/lib/i18n';
import type {
  PolicyBlock,
  PolicySection,
  PrivacyPolicyContent,
} from '@/locales/privacy-policy-content';

export type { PolicyBlock, PolicySection };

const cs: PrivacyPolicyContent = {
  title: 'Obchodní podmínky služby AuditReady',
  sections: [
    {
      number: '1',
      title: 'Základní informace',
      blocks: [
        {
          type: 'p',
          text: 'Tyto obchodní podmínky upravují práva a povinnosti související s používáním webových stránek, webové aplikace a online služeb poskytovaných pod značkou AuditReady.',
        },
        { type: 'p', text: 'Provozovatelem služby AuditReady je:' },
        { type: 'p', text: 'AuditReady s.r.o.' },
        {
          type: 'p',
          text: 'se sídlem Francouzská 312/100, Vršovice, 101 00 Praha 10',
        },
        { type: 'p', text: 'IČO: 06584128' },
        {
          type: 'p',
          text: 'zapsaná v obchodním rejstříku vedeném Městským soudem v Praze, oddíl C, vložka 284828',
        },
        { type: 'p', text: 'E-mail: info@auditready.cz' },
        {
          type: 'p',
          text: 'Tyto obchodní podmínky se vztahují na osoby, které používají webové stránky AuditReady, objednávají online službu AuditReady, vytvářejí nebo používají uživatelský účet, vyplňují online checklist, nahrávají podklady nebo využívají výstupní report vytvořený prostřednictvím služby AuditReady.',
        },
        {
          type: 'p',
          text: 'Používáním služby AuditReady, vytvořením uživatelského účtu, objednáním služby nebo uhrazením ceny služby potvrzujete, že jste se s těmito obchodními podmínkami seznámili a souhlasíte s nimi.',
        },
      ],
    },
    {
      number: '2',
      title: 'Popis služby AuditReady',
      blocks: [
        {
          type: 'p',
          text: 'AuditReady je online platforma určená k podpoře organizací při přípravě, vyhodnocování a správě vybraných oblastí kybernetické bezpečnosti, bezpečnostní dokumentace, odolnosti organizace, řízení souladu s požadavky a souvisejících bezpečnostních procesů.',
        },
        {
          type: 'p',
          text: 'Služba může zahrnovat různé samostatné produkty, moduly nebo nástroje, například online sebehodnoticí checklisty, řízenou tvorbu bezpečnostní dokumentace, nástroje pro přípravu plánů obnovy, nástroje pro posouzení připravenosti organizace, generování výstupních reportů nebo další funkce dostupné v rámci webové aplikace AuditReady.',
        },
        {
          type: 'p',
          text: 'Konkrétní rozsah služby, dostupné funkce, typ zpracovávaných vstupů, způsob vyhodnocení, podoba výstupů a případné limity se mohou lišit podle zvoleného produktu, modulu, balíčku nebo verze služby.',
        },
        {
          type: 'p',
          text: 'Uživatel může v rámci služby zadávat informace, odpovídat na otázky, doplňovat poznámky, nahrávat dokumenty nebo jiné podklady, pracovat s připravenými šablonami, generovat výstupy nebo využívat jiné funkce, které jsou pro daný produkt nebo modul dostupné.',
        },
        {
          type: 'p',
          text: 'Výstupy služby mohou mít podobu reportů, návrhů dokumentů, plánů, přehledů, doporučení, pracovních podkladů nebo jiných materiálů vytvořených na základě údajů zadaných uživatelem a pravidel nastavených ve službě.',
        },
        {
          type: 'p',
          text: 'Služba AuditReady je určena především pro podnikatele, právnické osoby, veřejnoprávní subjekty a jiné organizace, které chtějí získat strukturovanou podporu při přípravě, vyhodnocování nebo zlepšování vybraných oblastí kybernetické bezpečnosti, souladu s požadavky nebo organizační odolnosti.',
        },
      ],
    },
    {
      number: '3',
      title: 'Povaha výstupu a omezení služby',
      blocks: [
        {
          type: 'p',
          text: 'Služba AuditReady poskytuje uživatelům strukturovanou podporu při přípravě, vyhodnocování nebo tvorbě vybraných bezpečnostních, organizačních a souvisejících výstupů. Výstupy služby jsou vytvářeny zejména na základě údajů, odpovědí, dokumentů, podkladů a dalších informací zadaných uživatelem.',
        },
        {
          type: 'p',
          text: 'Výstupy služby mají podpůrný, pracovní a orientační charakter. Mohou sloužit jako podklad pro interní rozhodování, přípravu organizace, identifikaci oblastí vyžadujících další pozornost nebo jako základ pro následné odborné posouzení.',
        },
        {
          type: 'p',
          text: 'Služba AuditReady nepředstavuje právní poradenství, daňové poradenství, certifikační audit, formální audit podle ISO/IEC 27001, audit podle zákona o kybernetické bezpečnosti, posouzení shody provedené autorizovanou osobou ani oficiální stanovisko orgánu veřejné moci.',
        },
        {
          type: 'p',
          text: 'Použití služby samo o sobě nezaručuje splnění právních, regulatorních, smluvních, normativních nebo interních požadavků vztahujících se na zákazníka. Splnění těchto požadavků závisí zejména na skutečném stavu organizace, úplnosti a správnosti zadaných údajů, přijatých opatřeních a případném odborném posouzení.',
        },
        {
          type: 'p',
          text: 'Zákazník bere na vědomí, že výstupy služby nenahrazují individuální odborné, právní, auditorské, technické ani bezpečnostní posouzení konkrétní situace organizace. Před přijetím významných rozhodnutí na základě výstupu služby doporučujeme provést samostatné odborné posouzení nebo konzultaci s příslušným specialistou.',
        },
        {
          type: 'p',
          text: 'Společnost AuditReady s.r.o. neodpovídá za nesprávnost, neúplnost nebo nevhodnost výstupu způsobenou nepravdivými, neúplnými, nepřesnými nebo zastaralými údaji zadanými uživatelem.',
        },
      ],
    },
    {
      number: '4',
      title: 'Uživatelský účet a používání služby',
      blocks: [
        {
          type: 'p',
          text: 'Pro používání některých částí služby AuditReady může být vyžadováno vytvoření uživatelského účtu. Uživatelský účet slouží k přístupu do webové aplikace, správě zakoupených služeb, vyplňování vstupů, práci s dostupnými moduly, generování výstupů a případné komunikaci se zákaznickou nebo technickou podporou.',
        },
        {
          type: 'p',
          text: 'Uživatel je povinen při registraci a používání služby uvádět pravdivé, přesné a aktuální údaje. Pokud se údaje uvedené v uživatelském účtu změní, je uživatel povinen je bez zbytečného odkladu aktualizovat nebo o změně informovat provozovatele.',
        },
        {
          type: 'p',
          text: 'Uživatel je povinen chránit své přístupové údaje, zejména heslo, a nesmí je sdílet s jinými osobami. Uživatel odpovídá za veškeré činnosti provedené prostřednictvím jeho uživatelského účtu, pokud byly způsobeny porušením jeho povinnosti chránit přístupové údaje nebo umožněním přístupu neoprávněné osobě.',
        },
        {
          type: 'p',
          text: 'Přístup do uživatelského účtu může být chráněn vícefaktorovým ověřením nebo jinými bezpečnostními mechanismy. Pokud je vícefaktorové ověření pro konkrétní službu nebo modul vyžadováno, je uživatel povinen jej používat.',
        },
        {
          type: 'p',
          text: 'Uživatel nesmí používat službu způsobem, který by mohl narušit její provoz, bezpečnost, dostupnost nebo integritu. Zejména není dovoleno pokoušet se získat neoprávněný přístup k účtům jiných uživatelů, obcházet technická omezení služby, provádět automatizované dotazy bez souhlasu provozovatele, testovat zranitelnosti služby bez předchozího písemného souhlasu nebo používat službu k protiprávní činnosti.',
        },
        {
          type: 'p',
          text: 'Provozovatel je oprávněn dočasně omezit, pozastavit nebo zrušit přístup uživatele ke službě, pokud má důvodné podezření, že dochází k porušení těchto obchodních podmínek, zneužití služby, ohrožení bezpečnosti služby, neoprávněnému přístupu, porušení práv třetích osob nebo jinému jednání, které může způsobit škodu provozovateli, zákazníkům nebo jiným osobám.',
        },
      ],
    },
    {
      number: '5',
      title: 'Objednávka, cena, platba a fakturace',
      blocks: [
        {
          type: 'p',
          text: 'Službu AuditReady je možné objednat prostřednictvím webových stránek, webové aplikace nebo jiným způsobem umožněným provozovatelem. Konkrétní nabídka služeb, dostupné produkty, moduly, balíčky, ceny a případné limity jsou uvedeny na webových stránkách AuditReady nebo v rámci objednávkového procesu.',
        },
        {
          type: 'p',
          text: 'Odesláním objednávky zákazník potvrzuje, že se seznámil s těmito obchodními podmínkami, zásadami zpracování osobních údajů a dalšími informacemi vztahujícími se ke zvolené službě. Smlouva mezi zákazníkem a provozovatelem je uzavřena okamžikem potvrzení objednávky provozovatelem, případně okamžikem úspěšné úhrady ceny služby, pokud je služba zpřístupňována až po zaplacení.',
        },
        {
          type: 'p',
          text: 'Cena služby je uvedena u konkrétního produktu, modulu nebo balíčku. Není-li výslovně uvedeno jinak, cena je splatná před zpřístupněním služby. Provozovatel si vyhrazuje právo měnit ceny služeb, přičemž změna ceny nemá vliv na již potvrzené a uhrazené objednávky.',
        },
        {
          type: 'p',
          text: 'Platby za službu mohou být prováděny prostřednictvím externího poskytovatele platebních služeb, zejména prostřednictvím společnosti Stripe Payments Europe, Ltd., případně jiným způsobem uvedeným v objednávkovém procesu. Provozovatel nezpracovává údaje o platební kartě přímo, pokud je platba prováděna prostřednictvím externí platební brány.',
        },
        {
          type: 'p',
          text: 'Po úspěšném zaplacení může být zákazníkovi zpřístupněna příslušná služba, produkt, modul nebo uživatelský účet. Doba zpřístupnění služby se může lišit podle typu služby, technického nastavení, ověření platby nebo dalších podmínek uvedených u konkrétního produktu.',
        },
        {
          type: 'p',
          text: 'Daňový nebo účetní doklad je zákazníkovi vystaven v elektronické podobě a zaslán na e-mailovou adresu uvedenou v objednávce, případně zpřístupněn v uživatelském účtu. Zákazník odpovídá za správnost fakturačních údajů uvedených v objednávce.',
        },
      ],
    },
    {
      number: '6',
      title: 'Vkládání údajů, dokumentů a podkladů',
      blocks: [
        {
          type: 'p',
          text: 'V rámci používání služby AuditReady může uživatel zadávat informace, odpovědi, poznámky, komentáře, dokumenty, screenshoty, exporty, interní podklady nebo jiné materiály potřebné pro využití konkrétního produktu, modulu nebo funkce služby.',
        },
        {
          type: 'p',
          text: 'Zákazník odpovídá za správnost, úplnost, aktuálnost a přiměřenost údajů, které do služby zadá nebo nahraje. Výstupy služby jsou vytvářeny na základě údajů poskytnutých uživatelem, a proto může mít nepravdivý, neúplný, nepřesný nebo zastaralý vstup vliv na kvalitu, relevanci a použitelnost výsledného výstupu.',
        },
        {
          type: 'p',
          text: 'Zákazník odpovídá za to, že je oprávněn vkládat do služby veškeré údaje, dokumenty a podklady, které prostřednictvím služby zpracovává, a že tím neporušuje právní předpisy, smluvní povinnosti, práva třetích osob, obchodní tajemství ani jiné chráněné zájmy.',
        },
        {
          type: 'p',
          text: 'Uživatel je povinen vkládat do služby pouze takové údaje a dokumenty, které jsou nezbytné nebo přiměřené pro účel použití konkrétního produktu nebo modulu. Do služby nesmí být vkládána hesla, autentizační údaje, přístupové tokeny, privátní kryptografické klíče, obnovovací kódy, nadbytečně citlivé osobní údaje ani jiné informace, jejichž vložení není pro využití služby nezbytné a mohlo by zvýšit bezpečnostní riziko pro zákazníka, provozovatele nebo třetí osoby.',
        },
        {
          type: 'p',
          text: 'Nahrané dokumenty a podklady jsou používány pouze za účelem poskytnutí příslušné služby, zpracování vstupů, vytvoření výstupu, zajištění provozu služby, řešení technické podpory nebo splnění právních povinností provozovatele.',
        },
        {
          type: 'p',
          text: 'Provozovatel není povinen aktivně kontrolovat správnost, úplnost, zákonnost ani obsah všech údajů, dokumentů a podkladů vložených uživatelem. Provozovatel je však oprávněn omezit nebo odstranit obsah, případně pozastavit přístup ke službě, pokud má důvodné podezření, že vložený obsah porušuje tyto obchodní podmínky, právní předpisy, práva třetích osob nebo ohrožuje bezpečnost služby.',
        },
      ],
    },
    {
      number: '7',
      title: 'Výstupní report',
      blocks: [
        {
          type: 'p',
          text: 'Služba AuditReady může na základě údajů zadaných uživatelem vytvářet výstupy v podobě reportů, návrhů dokumentů, plánů, přehledů, doporučení, pracovních podkladů nebo jiných materiálů dostupných v rámci konkrétního produktu nebo modulu.',
        },
        {
          type: 'p',
          text: 'Výstup je vytvářen zejména na základě informací, odpovědí, dokumentů, poznámek a dalších podkladů zadaných uživatelem. Kvalita, úplnost, přesnost a použitelnost výstupu proto závisí zejména na kvalitě, správnosti a úplnosti vstupních údajů poskytnutých zákazníkem nebo uživatelem.',
        },
        {
          type: 'p',
          text: 'Výstup služby je určen především pro interní potřebu zákazníka jako podpůrný, pracovní nebo orientační materiál. Výstup nepředstavuje oficiální potvrzení souladu, právní stanovisko, certifikační dokument, formální auditní zprávu ani závazné posouzení ze strany orgánu veřejné moci.',
        },
        {
          type: 'p',
          text: 'Zákazník odpovídá za odborné posouzení výstupu před jeho použitím pro významná rozhodnutí, předložení třetím osobám, interní schválení, implementaci opatření nebo jiné navazující kroky.',
        },
        {
          type: 'p',
          text: 'Pokud služba umožňuje stažení výstupu, je zákazník odpovědný za jeho včasné stažení a uložení. Po uplynutí doby uchování údajů nebo po automatickém smazání dat již nemusí být možné výstup znovu obnovit nebo stáhnout.',
        },
        {
          type: 'p',
          text: 'Provozovatel je oprávněn průběžně upravovat strukturu, vzhled, rozsah nebo obsahovou logiku výstupů služby, zejména za účelem zlepšení služby, aktualizace obsahu, zapracování nových požadavků nebo úpravy konkrétních produktů a modulů.',
        },
      ],
    },
    {
      number: '8',
      title: 'Dostupnost služby, údržba a podpora',
      blocks: [
        {
          type: 'p',
          text: 'Služba AuditReady je poskytována jako online služba dostupná prostřednictvím webových stránek nebo webové aplikace. Provozovatel usiluje o to, aby byla služba dostupná a funkční, avšak nepřetržitá dostupnost služby není zaručena, pokud není u konkrétní služby nebo ve zvláštní smlouvě výslovně uvedeno jinak.',
        },
        {
          type: 'p',
          text: 'Dostupnost služby může být dočasně omezena zejména z důvodu plánované nebo neplánované údržby, aktualizace systému, technických úprav, bezpečnostních opatření, výpadku infrastruktury, zásahu dodavatelů, vyšší moci nebo jiných okolností, které provozovatel nemůže plně ovlivnit.',
        },
        {
          type: 'p',
          text: 'Provozovatel je oprávněn provádět údržbu, aktualizace, opravy, změny nebo technické úpravy služby, pokud je to potřebné pro její provoz, bezpečnost, rozvoj, odstranění chyb nebo zlepšení funkcionality. Pokud to bude přiměřeně možné, bude provozovatel provádět plánovanou údržbu způsobem, který minimalizuje dopad na uživatele.',
        },
        {
          type: 'p',
          text: 'Technická nebo zákaznická podpora je poskytována zejména prostřednictvím e-mailu info@auditready.cz, případně jiným způsobem uvedeným na webových stránkách nebo v uživatelském účtu. Rozsah a dostupnost podpory se mohou lišit podle konkrétního produktu, modulu, balíčku nebo verze služby.',
        },
        {
          type: 'p',
          text: 'Pokud není výslovně sjednáno jinak, služba není poskytována s garantovanou úrovní dostupnosti, dobou odezvy podpory ani jiným závazným SLA. Provozovatel neodpovídá za nemožnost používat službu způsobenou technickým vybavením, připojením k internetu, nastavením prohlížeče, bezpečnostním softwarem nebo jinými prostředky na straně uživatele nebo zákazníka.',
        },
      ],
    },
    {
      number: '9',
      title: 'Ochrana dat, důvěrnost a mazání údajů',
      blocks: [
        {
          type: 'p',
          text: 'Provozovatel přijímá přiměřená technická a organizační opatření k ochraně údajů, dokumentů, podkladů a dalších informací zpracovávaných v rámci služby AuditReady. Cílem těchto opatření je chránit data před neoprávněným přístupem, ztrátou, zneužitím, neoprávněnou změnou, zveřejněním nebo zničením.',
        },
        {
          type: 'p',
          text: 'Údaje, dokumenty a podklady vložené zákazníkem jsou používány pouze v rozsahu nezbytném pro poskytnutí příslušné služby, zpracování vstupů, vytvoření výstupu, zajištění provozu služby, technickou podporu, bezpečnost služby, splnění právních povinností nebo ochranu právních nároků provozovatele.',
        },
        {
          type: 'p',
          text: 'Provozovatel bude s neveřejnými informacemi zákazníka, které mu budou zpřístupněny při používání služby, zacházet jako s důvěrnými. To neplatí pro informace, které jsou veřejně dostupné, které byly provozovateli známé již dříve bez povinnosti mlčenlivosti, které provozovatel získal oprávněně od třetí osoby, nebo které musí být zpřístupněny na základě právního předpisu, rozhodnutí orgánu veřejné moci nebo za účelem ochrany právních nároků.',
        },
        {
          type: 'p',
          text: 'Zákazník bere na vědomí, že služba není určena k dlouhodobému ukládání dokumentů, záloh, archivních dat ani jiných podkladů zákazníka. Pokud není u konkrétního produktu nebo modulu uvedeno jinak, služba slouží pouze k dočasnému zpracování údajů za účelem vytvoření příslušného výstupu.',
        },
        {
          type: 'p',
          text: 'Údaje vložené do služby, zejména odpovědi, poznámky, komentáře, nahrané podklady a vytvořené výstupy, mohou být po poskytnutí služby automaticky smazány. Pokud je u konkrétního produktu nebo modulu nastaveno automatické mazání, budou příslušné údaje odstraněny nejpozději do 48 hodin od vytvoření výstupu, není-li u dané služby uvedena jiná lhůta.',
        },
        {
          type: 'p',
          text: 'Po smazání údajů nemusí být možné obnovit nahrané podklady, rozpracované vstupy ani vytvořený výstup. Zákazník je proto odpovědný za včasné stažení a uložení výstupů, které chce dále používat.',
        },
        {
          type: 'p',
          text: 'Podrobnosti o zpracování osobních údajů, včetně účelů zpracování, právních základů, příjemců údajů, doby uchování a práv subjektů údajů, jsou uvedeny v samostatných Zásadách zpracování osobních údajů dostupných na webových stránkách AuditReady.',
        },
      ],
    },
    {
      number: '10',
      title: 'Reklamace, odstoupení a vrácení peněz',
      blocks: [
        {
          type: 'p',
          text: 'Služba AuditReady je určena především pro podnikatele, právnické osoby, veřejnoprávní subjekty a jiné organizace. Není-li výslovně uvedeno jinak, služba není určena pro spotřebitelské použití.',
        },
        {
          type: 'p',
          text: 'Zákazník je oprávněn reklamovat technickou vadu služby, zejména pokud mu po úspěšné platbě nebyl zpřístupněn zakoupený produkt nebo modul, pokud nelze z důvodu chyby na straně provozovatele dokončit objednanou službu, vytvořit výstup nebo stáhnout výstup, ačkoliv zákazník splnil podmínky použití služby.',
        },
        {
          type: 'p',
          text: 'Reklamaci je možné uplatnit prostřednictvím e-mailu info@auditready.cz. Reklamace by měla obsahovat identifikaci zákazníka, popis zakoupené služby, popis vady, datum objednávky nebo platby a případně další informace potřebné k ověření a vyřízení reklamace.',
        },
        {
          type: 'p',
          text: 'Provozovatel reklamaci posoudí a v přiměřené lhůtě informuje zákazníka o výsledku. Podle povahy vady může provozovatel zejména obnovit nebo zpřístupnit službu, umožnit opakované vygenerování výstupu, prodloužit dobu přístupu, odstranit technickou chybu, poskytnout přiměřenou náhradní možnost využití služby nebo vrátit uhrazenou částku.',
        },
        {
          type: 'p',
          text: 'Vrácení peněz může být poskytnuto zejména v případě, kdy služba nebyla zákazníkovi vůbec zpřístupněna z důvodu chyby na straně provozovatele, nebo kdy nebylo možné službu podstatným způsobem využít a vadu nebylo možné odstranit jiným přiměřeným způsobem.',
        },
        {
          type: 'p',
          text: 'Vrácení peněz se zpravidla neposkytuje v případě, kdy byla služba zákazníkovi řádně zpřístupněna a zákazník ji využil, zejména pokud již zadal údaje, nahrál podklady, vytvořil nebo stáhl výstup. Vrácení peněz se dále neposkytuje pouze z důvodu, že zákazník není spokojen s obsahem výstupu, pokud byl výstup vytvořen na základě údajů zadaných zákazníkem a služba fungovala v souladu se svým určením.',
        },
        {
          type: 'p',
          text: 'Pokud zákazník poruší tyto obchodní podmínky, zejména zneužije službu, vloží zakázaný obsah, ohrozí bezpečnost služby nebo umožní neoprávněný přístup ke svému účtu, je provozovatel oprávněn přístup ke službě omezit nebo zrušit bez nároku zákazníka na vrácení uhrazené částky.',
        },
      ],
    },
    {
      number: '11',
      title: 'Omezení odpovědnosti',
      blocks: [
        {
          type: 'p',
          text: 'Služba AuditReady a její výstupy jsou poskytovány jako podpůrný, pracovní a orientační nástroj. Provozovatel neodpovídá za rozhodnutí zákazníka učiněná výhradně na základě výstupu služby bez dalšího odborného, právního, technického, bezpečnostního nebo interního posouzení.',
        },
        {
          type: 'p',
          text: 'Provozovatel neodpovídá za nesprávnost, neúplnost, nepřesnost nebo nevhodnost výstupu, pokud byla způsobena nepravdivými, neúplnými, nepřesnými, zastaralými nebo nevhodně zadanými údaji, dokumenty nebo podklady ze strany zákazníka nebo uživatele.',
        },
        {
          type: 'p',
          text: 'Provozovatel neodpovídá za to, že použití služby nebo jejích výstupů samo o sobě zajistí splnění právních, regulatorních, smluvních, normativních, interních nebo auditních požadavků vztahujících se na zákazníka. Odpovědnost za skutečné zavedení, udržování a doložení příslušných opatření nese zákazník.',
        },
        {
          type: 'p',
          text: 'Provozovatel neodpovídá za škodu, ztrátu dat, ztrátu výstupu, ztrátu obchodní příležitosti, ušlý zisk nebo jiné následky vzniklé v důsledku použití služby v rozporu s těmito obchodními podmínkami, použití výstupu mimo jeho účel, opožděného stažení výstupu, vložení nevhodných údajů nebo porušení povinností zákazníka či uživatele.',
        },
        {
          type: 'p',
          text: 'Provozovatel neodpovídá za výpadky, omezení, chyby nebo nedostupnost způsobené poskytovateli infrastruktury, cloudových služeb, platebních služeb, e-mailových služeb, připojením k internetu, technickým vybavením uživatele, nastavením prohlížeče, bezpečnostním softwarem nebo jinými okolnostmi mimo přiměřenou kontrolu provozovatele.',
        },
        {
          type: 'p',
          text: 'Provozovatel neodpovídá za zneužití uživatelského účtu, pokud k němu došlo v důsledku porušení povinnosti uživatele chránit přístupové údaje, sdílení účtu s jinou osobou, nedostatečného zabezpečení zařízení uživatele nebo jiného jednání na straně zákazníka či uživatele.',
        },
        {
          type: 'p',
          text: 'Tímto ustanovením není vyloučena ani omezena odpovědnost, kterou nelze podle právních předpisů vyloučit nebo omezit.',
        },
      ],
    },
    {
      number: '12',
      title: 'Práva duševního vlastnictví',
      blocks: [
        {
          type: 'p',
          text: 'Webové stránky, webová aplikace, obsah služby AuditReady, texty, otázky, checklisty, metodiky, šablony, struktura výstupů, grafické prvky, design, databáze, know-how, obchodní označení a další prvky služby jsou chráněny právními předpisy na ochranu duševního vlastnictví a náleží provozovateli nebo jeho dodavatelům.',
        },
        {
          type: 'p',
          text: 'Zákazník získává pouze omezené, nevýhradní, nepřevoditelné a časově omezené oprávnění používat službu AuditReady v rozsahu odpovídajícím zakoupenému produktu, modulu nebo balíčku a v souladu s těmito obchodními podmínkami.',
        },
        {
          type: 'p',
          text: 'Bez předchozího písemného souhlasu provozovatele není dovoleno zejména kopírovat, rozmnožovat, šířit, zveřejňovat, upravovat, překládat, zpětně analyzovat, vytěžovat, komerčně využívat nebo jinak neoprávněně používat obsah služby, checklisty, otázky, metodiky, šablony, strukturu aplikace, výstupní logiku nebo jiné chráněné prvky služby.',
        },
        {
          type: 'p',
          text: 'Zákazník je oprávněn používat výstupy vytvořené službou AuditReady pro vlastní interní potřeby, zejména pro interní přípravu, vyhodnocování, plánování, zlepšování bezpečnostních opatření, řízení souladu nebo související organizační účely.',
        },
        {
          type: 'p',
          text: 'Není-li výslovně sjednáno jinak, zákazník není oprávněn výstupy služby dále prodávat, samostatně komerčně poskytovat třetím osobám, používat je jako vlastní konkurenční produkt, vytvářet z nich odvozené komerční služby nebo je používat způsobem, který by porušoval práva provozovatele nebo obcházel účel služby.',
        },
        {
          type: 'p',
          text: 'Zákazník si zachovává práva ke svým vlastním údajům, dokumentům a podkladům, které do služby vloží. Vložením těchto údajů a podkladů zákazník poskytuje provozovateli oprávnění je zpracovat v rozsahu nezbytném pro poskytnutí služby, vytvoření výstupu, zajištění provozu služby, technickou podporu a plnění povinností podle těchto obchodních podmínek.',
        },
      ],
    },
    {
      number: '13',
      title: 'Změny podmínek a závěrečná ustanovení',
      blocks: [
        {
          type: 'p',
          text: 'Provozovatel je oprávněn tyto obchodní podmínky průběžně měnit nebo doplňovat, zejména v souvislosti se změnami služby, rozšířením funkcí, změnou právních požadavků, změnou technického řešení, změnou cenových modelů nebo změnou způsobu poskytování služby.',
        },
        {
          type: 'p',
          text: 'Aktuální znění obchodních podmínek bude vždy dostupné na webových stránkách AuditReady. Pokud dojde k podstatné změně obchodních podmínek, může provozovatel zákazníky informovat také jiným vhodným způsobem, například prostřednictvím e-mailu nebo oznámení ve webové aplikaci.',
        },
        {
          type: 'p',
          text: 'Změny obchodních podmínek se nevztahují zpětně na již uhrazené jednorázové služby, pokud není výslovně uvedeno jinak nebo pokud změna nevyplývá z právních předpisů.',
        },
        {
          type: 'p',
          text: 'Právní vztahy mezi provozovatelem a zákazníkem se řídí právním řádem České republiky. Případné spory se strany zavazují řešit přednostně smírnou cestou prostřednictvím vzájemné komunikace.',
        },
        {
          type: 'p',
          text: 'Pokud by některé ustanovení těchto obchodních podmínek bylo nebo se stalo neplatným, neúčinným nebo nevymahatelným, nemá to vliv na platnost a účinnost ostatních ustanovení. Neplatné nebo neúčinné ustanovení bude nahrazeno ustanovením, které se svým smyslem a účelem co nejvíce blíží původnímu ustanovení.',
        },
        { type: 'p', text: 'Tyto obchodní podmínky jsou účinné ode dne 10.5.2026.' },
        { type: 'p', text: 'Kontaktní e-mail provozovatele: info@auditready.cz.' },
      ],
    },
  ],
};

const en: PrivacyPolicyContent = {
  title: 'AuditReady Service Terms and Conditions',
  sections: [
    {
      number: '1',
      title: 'Basic Information',
      blocks: [
        {
          type: 'p',
          text: 'These terms and conditions govern the rights and obligations related to the use of the websites, web application, and online services provided under the AuditReady brand.',
        },
        { type: 'p', text: 'The operator of the AuditReady service is:' },
        { type: 'p', text: 'AuditReady s.r.o.' },
        {
          type: 'p',
          text: 'registered office at Francouzská 312/100, Vršovice, 101 00 Prague 10, Czech Republic',
        },
        { type: 'p', text: 'Company ID (IČO): 06584128' },
        {
          type: 'p',
          text: 'registered in the Commercial Register maintained by the Municipal Court in Prague, Section C, Insert 284828',
        },
        { type: 'p', text: 'E-mail: info@auditready.cz' },
        {
          type: 'p',
          text: 'These terms and conditions apply to persons who use the AuditReady websites, order the AuditReady online service, create or use a user account, complete an online checklist, upload supporting materials, or use an output report created through the AuditReady service.',
        },
        {
          type: 'p',
          text: 'By using the AuditReady service, creating a user account, ordering the service, or paying for the service, you confirm that you have read these terms and conditions and agree to them.',
        },
      ],
    },
    {
      number: '2',
      title: 'Description of the AuditReady Service',
      blocks: [
        {
          type: 'p',
          text: 'AuditReady is an online platform designed to support organizations in preparing, evaluating, and managing selected areas of cybersecurity, security documentation, organizational resilience, compliance management, and related security processes.',
        },
        {
          type: 'p',
          text: 'The service may include various standalone products, modules, or tools, such as online self-assessment checklists, guided creation of security documentation, business continuity planning tools, organizational readiness assessment tools, generation of output reports, or other features available within the AuditReady web application.',
        },
        {
          type: 'p',
          text: 'The specific scope of the service, available features, types of inputs processed, evaluation method, form of outputs, and any limits may vary depending on the selected product, module, package, or version of the service.',
        },
        {
          type: 'p',
          text: 'Within the service, the user may enter information, answer questions, add notes, upload documents or other supporting materials, work with prepared templates, generate outputs, or use other features available for the relevant product or module.',
        },
        {
          type: 'p',
          text: 'Service outputs may take the form of reports, draft documents, plans, summaries, recommendations, working materials, or other materials created based on data entered by the user and rules configured in the service.',
        },
        {
          type: 'p',
          text: 'The AuditReady service is intended primarily for entrepreneurs, legal entities, public-law entities, and other organizations seeking structured support in preparing, evaluating, or improving selected areas of cybersecurity, regulatory compliance, or organizational resilience.',
        },
      ],
    },
    {
      number: '3',
      title: 'Nature of Outputs and Service Limitations',
      blocks: [
        {
          type: 'p',
          text: 'The AuditReady service provides users with structured support in preparing, evaluating, or creating selected security, organizational, and related outputs. Service outputs are created primarily based on data, answers, documents, supporting materials, and other information entered by the user.',
        },
        {
          type: 'p',
          text: 'Service outputs are supportive, working, and orientational in nature. They may serve as a basis for internal decision-making, organizational preparation, identification of areas requiring further attention, or as a foundation for subsequent expert assessment.',
        },
        {
          type: 'p',
          text: 'The AuditReady service does not constitute legal advice, tax advice, certification audit, formal audit under ISO/IEC 27001, audit under the Cybersecurity Act, conformity assessment performed by an authorized person, or an official opinion of a public authority.',
        },
        {
          type: 'p',
          text: 'Use of the service alone does not guarantee compliance with legal, regulatory, contractual, normative, or internal requirements applicable to the customer. Compliance with such requirements depends primarily on the actual state of the organization, completeness and accuracy of entered data, measures adopted, and any expert assessment.',
        },
        {
          type: 'p',
          text: 'The customer acknowledges that service outputs do not replace individual expert, legal, audit, technical, or security assessment of the organization’s specific situation. Before making significant decisions based on a service output, we recommend obtaining an independent expert assessment or consultation with the appropriate specialist.',
        },
        {
          type: 'p',
          text: 'AuditReady s.r.o. is not liable for incorrect, incomplete, or inappropriate outputs caused by false, incomplete, inaccurate, or outdated data entered by the user.',
        },
      ],
    },
    {
      number: '4',
      title: 'User Account and Use of the Service',
      blocks: [
        {
          type: 'p',
          text: 'Creating a user account may be required to use certain parts of the AuditReady service. A user account provides access to the web application, management of purchased services, completion of inputs, work with available modules, generation of outputs, and possible communication with customer or technical support.',
        },
        {
          type: 'p',
          text: 'The user must provide truthful, accurate, and up-to-date information when registering and using the service. If information in the user account changes, the user must update it without undue delay or inform the operator of the change.',
        },
        {
          type: 'p',
          text: 'The user must protect their access credentials, especially their password, and must not share them with others. The user is responsible for all activities performed through their user account if caused by failure to protect access credentials or by allowing unauthorized access.',
        },
        {
          type: 'p',
          text: 'Access to the user account may be protected by multi-factor authentication or other security mechanisms. If multi-factor authentication is required for a specific service or module, the user must use it.',
        },
        {
          type: 'p',
          text: 'The user must not use the service in a manner that could disrupt its operation, security, availability, or integrity. In particular, it is prohibited to attempt unauthorized access to other users’ accounts, circumvent technical limitations of the service, perform automated queries without the operator’s consent, test service vulnerabilities without prior written consent, or use the service for unlawful activity.',
        },
        {
          type: 'p',
          text: 'The operator may temporarily restrict, suspend, or cancel the user’s access to the service if there is reasonable suspicion of breach of these terms, misuse of the service, threat to service security, unauthorized access, infringement of third-party rights, or other conduct that may cause harm to the operator, customers, or other persons.',
        },
      ],
    },
    {
      number: '5',
      title: 'Orders, Pricing, Payment, and Invoicing',
      blocks: [
        {
          type: 'p',
          text: 'The AuditReady service may be ordered through the websites, web application, or by other means permitted by the operator. The specific service offering, available products, modules, packages, prices, and any limits are stated on the AuditReady websites or within the ordering process.',
        },
        {
          type: 'p',
          text: 'By submitting an order, the customer confirms that they have read these terms and conditions, the personal data processing policy, and other information relating to the selected service. A contract between the customer and the operator is concluded upon confirmation of the order by the operator, or upon successful payment of the service price if the service is made available only after payment.',
        },
        {
          type: 'p',
          text: 'The service price is stated for the specific product, module, or package. Unless expressly stated otherwise, the price is due before the service is made available. The operator reserves the right to change service prices; price changes do not affect orders already confirmed and paid.',
        },
        {
          type: 'p',
          text: 'Payments for the service may be made through an external payment service provider, in particular Stripe Payments Europe, Ltd., or by other means stated in the ordering process. The operator does not process payment card data directly if payment is made through an external payment gateway.',
        },
        {
          type: 'p',
          text: 'After successful payment, the relevant service, product, module, or user account may be made available to the customer. The time until the service is made available may vary depending on the type of service, technical configuration, payment verification, or other conditions stated for the specific product.',
        },
        {
          type: 'p',
          text: 'A tax or accounting document is issued to the customer electronically and sent to the e-mail address stated in the order, or made available in the user account. The customer is responsible for the accuracy of billing details stated in the order.',
        },
      ],
    },
    {
      number: '6',
      title: 'Submission of Data, Documents, and Supporting Materials',
      blocks: [
        {
          type: 'p',
          text: 'When using the AuditReady service, the user may enter information, answers, notes, comments, documents, screenshots, exports, internal supporting materials, or other materials necessary to use a specific product, module, or feature of the service.',
        },
        {
          type: 'p',
          text: 'The customer is responsible for the accuracy, completeness, currency, and appropriateness of data entered or uploaded into the service. Service outputs are created based on data provided by the user; therefore, false, incomplete, inaccurate, or outdated input may affect the quality, relevance, and usability of the resulting output.',
        },
        {
          type: 'p',
          text: 'The customer is responsible for ensuring they are entitled to submit all data, documents, and supporting materials processed through the service and that doing so does not violate laws, contractual obligations, third-party rights, trade secrets, or other protected interests.',
        },
        {
          type: 'p',
          text: 'The user must submit only data and documents that are necessary or appropriate for the purpose of using the specific product or module. Passwords, authentication credentials, access tokens, private cryptographic keys, recovery codes, excessively sensitive personal data, or other information whose submission is not necessary for use of the service and could increase security risk for the customer, operator, or third parties must not be submitted.',
        },
        {
          type: 'p',
          text: 'Uploaded documents and supporting materials are used only to provide the relevant service, process inputs, create outputs, ensure service operation, resolve technical support, or fulfill the operator’s legal obligations.',
        },
        {
          type: 'p',
          text: 'The operator is not obliged to actively verify the accuracy, completeness, legality, or content of all data, documents, and supporting materials submitted by the user. However, the operator may restrict or remove content, or suspend access to the service, if there is reasonable suspicion that submitted content violates these terms, laws, third-party rights, or threatens service security.',
        },
      ],
    },
    {
      number: '7',
      title: 'Output Report',
      blocks: [
        {
          type: 'p',
          text: 'Based on data entered by the user, the AuditReady service may create outputs in the form of reports, draft documents, plans, summaries, recommendations, working materials, or other materials available within a specific product or module.',
        },
        {
          type: 'p',
          text: 'An output is created primarily based on information, answers, documents, notes, and other supporting materials submitted by the user. The quality, completeness, accuracy, and usability of the output therefore depend mainly on the quality, correctness, and completeness of input data provided by the customer or user.',
        },
        {
          type: 'p',
          text: 'A service output is intended primarily for the customer’s internal use as supportive, working, or orientational material. It does not constitute official confirmation of compliance, a legal opinion, a certification document, a formal audit report, or a binding assessment by a public authority.',
        },
        {
          type: 'p',
          text: 'The customer is responsible for expert review of the output before using it for significant decisions, submission to third parties, internal approval, implementation of measures, or other follow-up steps.',
        },
        {
          type: 'p',
          text: 'If the service allows downloading an output, the customer is responsible for timely download and storage. After the data retention period expires or after automatic deletion of data, it may no longer be possible to restore or download the output.',
        },
        {
          type: 'p',
          text: 'The operator may continuously adjust the structure, appearance, scope, or content logic of service outputs, in particular to improve the service, update content, incorporate new requirements, or modify specific products and modules.',
        },
      ],
    },
    {
      number: '8',
      title: 'Service Availability, Maintenance, and Support',
      blocks: [
        {
          type: 'p',
          text: 'The AuditReady service is provided as an online service available through the websites or web application. The operator strives to keep the service available and functional; however, uninterrupted availability is not guaranteed unless expressly stated otherwise for a specific service or in a separate agreement.',
        },
        {
          type: 'p',
          text: 'Service availability may be temporarily limited due to planned or unplanned maintenance, system updates, technical adjustments, security measures, infrastructure outages, supplier actions, force majeure, or other circumstances the operator cannot fully control.',
        },
        {
          type: 'p',
          text: 'The operator may perform maintenance, updates, repairs, changes, or technical adjustments to the service when necessary for its operation, security, development, bug fixes, or improved functionality. Where reasonably possible, the operator will perform planned maintenance in a way that minimizes impact on users.',
        },
        {
          type: 'p',
          text: 'Technical or customer support is provided primarily via e-mail at info@auditready.cz, or by other means stated on the websites or in the user account. The scope and availability of support may vary depending on the specific product, module, package, or version of the service.',
        },
        {
          type: 'p',
          text: 'Unless expressly agreed otherwise, the service is not provided with a guaranteed level of availability, support response time, or other binding SLA. The operator is not liable for inability to use the service caused by the user’s or customer’s equipment, internet connection, browser settings, security software, or other means on their side.',
        },
      ],
    },
    {
      number: '9',
      title: 'Data Protection, Confidentiality, and Data Deletion',
      blocks: [
        {
          type: 'p',
          text: 'The operator implements appropriate technical and organizational measures to protect data, documents, supporting materials, and other information processed within the AuditReady service. The purpose of these measures is to protect data against unauthorized access, loss, misuse, unauthorized modification, disclosure, or destruction.',
        },
        {
          type: 'p',
          text: 'Data, documents, and supporting materials submitted by the customer are used only to the extent necessary to provide the relevant service, process inputs, create outputs, ensure service operation, provide technical support, maintain service security, fulfill legal obligations, or protect the operator’s legal claims.',
        },
        {
          type: 'p',
          text: 'The operator will treat non-public customer information made available when using the service as confidential. This does not apply to information that is publicly available, was already known to the operator without a duty of confidentiality, was lawfully obtained from a third party, or must be disclosed under law, decision of a public authority, or to protect legal claims.',
        },
        {
          type: 'p',
          text: 'The customer acknowledges that the service is not intended for long-term storage of documents, backups, archival data, or other customer materials. Unless stated otherwise for a specific product or module, the service is intended only for temporary processing of data to create the relevant output.',
        },
        {
          type: 'p',
          text: 'Data entered into the service, especially answers, notes, comments, uploaded supporting materials, and created outputs, may be automatically deleted after the service is provided. If automatic deletion is configured for a specific product or module, the relevant data will be removed no later than 48 hours after the output is created, unless a different period is stated for that service.',
        },
        {
          type: 'p',
          text: 'After data deletion, it may not be possible to restore uploaded supporting materials, work in progress, or the created output. The customer is therefore responsible for timely download and storage of outputs they wish to continue using.',
        },
        {
          type: 'p',
          text: 'Details on personal data processing, including purposes, legal bases, recipients, retention periods, and data subject rights, are set out in the separate Personal Data Processing Policy available on the AuditReady websites.',
        },
      ],
    },
    {
      number: '10',
      title: 'Complaints, Withdrawal, and Refunds',
      blocks: [
        {
          type: 'p',
          text: 'The AuditReady service is intended primarily for entrepreneurs, legal entities, public-law entities, and other organizations. Unless expressly stated otherwise, the service is not intended for consumer use.',
        },
        {
          type: 'p',
          text: 'The customer may claim a technical defect of the service, in particular if the purchased product or module was not made available after successful payment, if the ordered service cannot be completed due to an error on the operator’s side, if an output cannot be created, or if an output cannot be downloaded although the customer met the conditions for using the service.',
        },
        {
          type: 'p',
          text: 'A complaint may be submitted via e-mail at info@auditready.cz. The complaint should include customer identification, description of the purchased service, description of the defect, order or payment date, and any other information needed to verify and handle the complaint.',
        },
        {
          type: 'p',
          text: 'The operator will assess the complaint and inform the customer of the outcome within a reasonable time. Depending on the nature of the defect, the operator may restore or make the service available, allow regeneration of the output, extend access, remove a technical error, provide a reasonable alternative way to use the service, or refund the amount paid.',
        },
        {
          type: 'p',
          text: 'A refund may be provided especially if the service was not made available to the customer at all due to an error on the operator’s side, or if the service could not be substantially used and the defect could not be remedied by other reasonable means.',
        },
        {
          type: 'p',
          text: 'A refund is generally not provided if the service was duly made available and the customer used it, especially if they already entered data, uploaded supporting materials, created, or downloaded an output. A refund is also not provided solely because the customer is dissatisfied with the content of the output if the output was created based on data entered by the customer and the service functioned as intended.',
        },
        {
          type: 'p',
          text: 'If the customer breaches these terms, in particular by misusing the service, submitting prohibited content, threatening service security, or allowing unauthorized access to their account, the operator may restrict or cancel access to the service without entitlement to a refund of the amount paid.',
        },
      ],
    },
    {
      number: '11',
      title: 'Limitation of Liability',
      blocks: [
        {
          type: 'p',
          text: 'The AuditReady service and its outputs are provided as a supportive, working, and orientational tool. The operator is not liable for customer decisions made solely on the basis of a service output without further expert, legal, technical, security, or internal assessment.',
        },
        {
          type: 'p',
          text: 'The operator is not liable for incorrect, incomplete, inaccurate, or inappropriate outputs caused by false, incomplete, inaccurate, outdated, or inappropriately submitted data, documents, or supporting materials from the customer or user.',
        },
        {
          type: 'p',
          text: 'The operator is not liable for the fact that use of the service or its outputs alone ensures compliance with legal, regulatory, contractual, normative, internal, or audit requirements applicable to the customer. Responsibility for actual implementation, maintenance, and demonstration of relevant measures lies with the customer.',
        },
        {
          type: 'p',
          text: 'The operator is not liable for damage, data loss, loss of output, loss of business opportunity, lost profit, or other consequences arising from use of the service in breach of these terms, use of an output outside its purpose, delayed download of an output, submission of inappropriate data, or breach of obligations by the customer or user.',
        },
        {
          type: 'p',
          text: 'The operator is not liable for outages, limitations, errors, or unavailability caused by infrastructure providers, cloud services, payment services, e-mail services, internet connection, user equipment, browser settings, security software, or other circumstances beyond the operator’s reasonable control.',
        },
        {
          type: 'p',
          text: 'The operator is not liable for misuse of a user account if it occurred due to failure to protect access credentials, sharing the account with another person, insufficient security of the user’s device, or other conduct on the part of the customer or user.',
        },
        {
          type: 'p',
          text: 'This provision does not exclude or limit liability that cannot be excluded or limited under applicable law.',
        },
      ],
    },
    {
      number: '12',
      title: 'Intellectual Property Rights',
      blocks: [
        {
          type: 'p',
          text: 'The websites, web application, content of the AuditReady service, texts, questions, checklists, methodologies, templates, output structure, graphic elements, design, databases, know-how, trade names, and other elements of the service are protected by intellectual property laws and belong to the operator or its suppliers.',
        },
        {
          type: 'p',
          text: 'The customer receives only a limited, non-exclusive, non-transferable, and time-limited right to use the AuditReady service to the extent corresponding to the purchased product, module, or package and in accordance with these terms.',
        },
        {
          type: 'p',
          text: 'Without the operator’s prior written consent, it is not permitted to copy, reproduce, distribute, publish, modify, translate, reverse engineer, extract, commercially exploit, or otherwise unlawfully use the content of the service, checklists, questions, methodologies, templates, application structure, output logic, or other protected elements of the service.',
        },
        {
          type: 'p',
          text: 'The customer may use outputs created by the AuditReady service for their own internal needs, in particular for internal preparation, evaluation, planning, improvement of security measures, compliance management, or related organizational purposes.',
        },
        {
          type: 'p',
          text: 'Unless expressly agreed otherwise, the customer is not entitled to resell service outputs, commercially provide them separately to third parties, use them as their own competing product, create derivative commercial services from them, or use them in a manner that infringes the operator’s rights or circumvents the purpose of the service.',
        },
        {
          type: 'p',
          text: 'The customer retains rights to their own data, documents, and supporting materials submitted to the service. By submitting such data and materials, the customer grants the operator the right to process them to the extent necessary to provide the service, create outputs, ensure service operation, provide technical support, and fulfill obligations under these terms.',
        },
      ],
    },
    {
      number: '13',
      title: 'Changes to Terms and Final Provisions',
      blocks: [
        {
          type: 'p',
          text: 'The operator may change or supplement these terms and conditions on an ongoing basis, in particular in connection with changes to the service, expansion of features, changes in legal requirements, changes in technical solutions, changes in pricing models, or changes in how the service is provided.',
        },
        {
          type: 'p',
          text: 'The current version of these terms and conditions will always be available on the AuditReady websites. If there is a material change to the terms, the operator may also inform customers by other appropriate means, such as e-mail or notice in the web application.',
        },
        {
          type: 'p',
          text: 'Changes to the terms do not apply retroactively to one-time services already paid for, unless expressly stated otherwise or required by law.',
        },
        {
          type: 'p',
          text: 'Legal relations between the operator and the customer are governed by the laws of the Czech Republic. The parties undertake to resolve any disputes primarily amicably through mutual communication.',
        },
        {
          type: 'p',
          text: 'If any provision of these terms is or becomes invalid, ineffective, or unenforceable, this does not affect the validity and effectiveness of the remaining provisions. An invalid or ineffective provision will be replaced by a provision that most closely matches the meaning and purpose of the original provision.',
        },
        { type: 'p', text: 'These terms and conditions are effective from 10 May 2026.' },
        { type: 'p', text: 'Operator contact e-mail: info@auditready.cz.' },
      ],
    },
  ],
};

export const termsOfServiceContent: Record<Locale, PrivacyPolicyContent> = {
  cs,
  en,
};
