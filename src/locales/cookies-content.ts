import type { Locale } from '@/lib/i18n';

export type CookiesParagraph = { type: 'p'; text: string };
export type CookiesList = { type: 'list'; items: string[] };
export type CookiesTable = {
  type: 'table';
  headers: string[];
  rows: string[][];
  footnote?: string;
};
export type CookiesSubsection = {
  type?: 'subsection';
  number: string;
  title: string;
  blocks: CookiesBlock[];
};
export type CookiesBlock =
  | CookiesParagraph
  | CookiesList
  | CookiesTable
  | CookiesSubsection;

export type CookiesSection = {
  number: string;
  title: string;
  blocks: CookiesBlock[];
};

export type CookiesContactBlock = {
  title: string;
  lines: string[];
};

export type CookiesContent = {
  title: string;
  intro?: CookiesParagraph[];
  sections: CookiesSection[];
  contactBlock?: CookiesContactBlock;
};

const cs: CookiesContent = {
  title: 'Zásady používání cookies služby AuditReady',
  intro: [
    {
      type: 'p',
      text: 'Tento dokument popisuje, jak společnost AuditReady s.r.o. používá cookies a obdobné technologie na webových stránkách a ve webové aplikaci AuditReady.',
    },
  ],
  sections: [
    {
      number: '1',
      title: 'Základní informace',
      blocks: [
        {
          type: 'p',
          text: 'Tyto zásady používání cookies vysvětlují, jakým způsobem používáme cookies a obdobné technologie v souvislosti s provozem webových stránek, webové aplikace a online služeb poskytovaných pod značkou AuditReady.',
        },
        { type: 'p', text: 'Provozovatelem webových stránek a služby AuditReady je:' },
        {
          type: 'p',
          text: 'AuditReady s.r.o., se sídlem Francouzská 312/100, Vršovice, 101 00 Praha 10, IČO: 06584128, zapsaná v obchodním rejstříku vedeném Městským soudem v Praze, oddíl C, vložka 284828, e-mail: info@auditready.cz.',
        },
        {
          type: 'p',
          text: 'Tyto zásady se vztahují na používání cookies a obdobných technologií při návštěvě webových stránek AuditReady, při používání webové aplikace, při správě uživatelského účtu a při využívání online služeb AuditReady.',
        },
        {
          type: 'p',
          text: 'Podrobnější informace o zpracování osobních údajů jsou uvedeny v samostatných Zásadách zpracování osobních údajů dostupných na webových stránkách AuditReady.',
        },
      ],
    },
    {
      number: '2',
      title: 'Co jsou cookies a obdobné technologie',
      blocks: [
        {
          type: 'p',
          text: 'Cookies jsou malé textové soubory, které mohou být při návštěvě webových stránek uloženy do zařízení uživatele, například do počítače, telefonu nebo tabletu. Cookies umožňují webové stránce nebo aplikaci rozpoznat zařízení uživatele, zapamatovat si některé volby, zajistit správné fungování služby nebo získat informace o používání webu.',
        },
        {
          type: 'p',
          text: 'Vedle cookies mohou být používány také obdobné technologie, například local storage, session storage nebo jiné technické mechanismy ukládání informací v prohlížeči. Pro zjednodušení jsou v těchto zásadách všechny tyto technologie označovány společně jako „cookies“, pokud není výslovně uvedeno jinak.',
        },
        {
          type: 'p',
          text: 'Cookies mohou být dočasné, tedy uložené pouze po dobu návštěvy webu nebo relace prohlížeče, nebo trvalé, které zůstávají v zařízení uživatele po určitou dobu nebo do jejich odstranění uživatelem.',
        },
        {
          type: 'p',
          text: 'Některé cookies jsou nezbytné pro správné fungování webu nebo aplikace. Jiné cookies, například analytické nebo marketingové, používáme pouze tehdy, pokud k tomu uživatel udělí souhlas prostřednictvím cookie lišty nebo jiného nástroje pro správu souhlasu.',
        },
      ],
    },
    {
      number: '3',
      title: 'Jaké typy cookies používáme',
      blocks: [
        {
          type: 'p',
          text: 'Na webových stránkách a ve webové aplikaci AuditReady můžeme používat tyto základní kategorie cookies:',
        },
        {
          number: '3.1',
          title: 'Nezbytné cookies',
          blocks: [
            {
              type: 'p',
              text: 'Nezbytné cookies jsou potřebné pro základní fungování webových stránek a webové aplikace. Bez těchto cookies by některé části služby nemusely fungovat správně. Tyto cookies se používají například pro zajištění bezpečnosti, správu přihlášení, uložení nastavení cookies, ochranu proti zneužití nebo zajištění technického provozu služby.',
            },
          ],
        },
        {
          number: '3.2',
          title: 'Analytické cookies',
          blocks: [
            {
              type: 'p',
              text: 'Analytické cookies nám pomáhají porozumět tomu, jak uživatelé webové stránky používají, které části webu jsou navštěvované a jak lze službu zlepšovat. Analytické cookies používáme pouze na základě souhlasu uživatele.',
            },
          ],
        },
        {
          number: '3.3',
          title: 'Marketingové cookies',
          blocks: [
            {
              type: 'p',
              text: 'Marketingové cookies mohou být používány za účelem měření účinnosti kampaní, vyhodnocování konverzí nebo zobrazování relevantnějšího obsahu. Marketingové cookies používáme pouze na základě souhlasu uživatele. Pokud marketingové cookies v dané době nepoužíváme, bude tato kategorie v nastavení cookies uvedena jako nepoužívaná nebo nebude aktivní.',
            },
          ],
        },
        {
          number: '3.4',
          title: 'Preferenční cookies',
          blocks: [
            {
              type: 'p',
              text: 'Preferenční cookies mohou sloužit k zapamatování voleb uživatele, například jazykového nastavení, zvoleného zobrazení nebo jiných uživatelských preferencí. Pokud jsou tyto cookies nezbytné pro fungování služby nebo pro uložení volby uživatele, mohou být zařazeny mezi nezbytné cookies. Pokud slouží pouze ke komfortnímu používání webu, mohou být používány podle nastavení souhlasu.',
            },
          ],
        },
      ],
    },
    {
      number: '4',
      title: 'Nezbytné cookies',
      blocks: [
        {
          type: 'p',
          text: 'Nezbytné cookies používáme proto, aby webové stránky a webová aplikace AuditReady mohly správně a bezpečně fungovat. Tyto cookies jsou obvykle nastavovány v reakci na akci uživatele, například při přihlášení, vyplnění formuláře, nastavení cookie preferencí nebo používání zabezpečené části aplikace.',
        },
        { type: 'p', text: 'Nezbytné cookies mohou sloužit zejména k těmto účelům:' },
        {
          type: 'list',
          items: [
            'zajištění základního fungování webových stránek a aplikace,',
            'správa uživatelské relace a přihlášení,',
            'ochrana proti neoprávněnému přístupu a zneužití služby,',
            'uložení nastavení cookie souhlasu,',
            'bezpečnostní ochrana formulářů a uživatelského účtu,',
            'technické zajištění provozu služby.',
          ],
        },
        {
          type: 'p',
          text: 'Použití nezbytných cookies není podmíněno souhlasem uživatele, protože jsou potřebné pro poskytování služby nebo pro zajištění jejího bezpečného provozu. Uživatel je může zakázat v nastavení svého prohlížeče, ale v takovém případě nemusí webové stránky nebo webová aplikace fungovat správně.',
        },
      ],
    },
    {
      number: '5',
      title: 'Analytické cookies',
      blocks: [
        {
          type: 'p',
          text: 'Analytické cookies mohou být používány za účelem měření návštěvnosti webových stránek, vyhodnocování používání webu, zlepšování obsahu, optimalizace uživatelského prostředí a zjišťování, zda web a jeho jednotlivé části fungují pro uživatele srozumitelně a efektivně.',
        },
        {
          type: 'p',
          text: 'Analytické cookies používáme pouze tehdy, pokud k tomu uživatel udělí souhlas prostřednictvím cookie lišty nebo jiného nástroje pro správu souhlasu. Pokud uživatel souhlas neudělí nebo jej později odvolá, analytické cookies nebudou aktivně používány.',
        },
        {
          type: 'p',
          text: 'Analytické nástroje mohou zpracovávat zejména informace o návštěvě webu, například navštívené stránky, dobu návštěvy, technické informace o zařízení a prohlížeči, přibližnou polohu odvozenou z IP adresy nebo informace o tom, odkud uživatel na web přišel.',
        },
        {
          type: 'p',
          text: 'Konkrétní analytický nástroj a konkrétní cookies budou doplněny podle skutečné implementace webu. Pokud budou analytické cookies používány, budou uvedeny v přehledu používaných cookies nebo přímo v nastavení cookie lišty.',
        },
      ],
    },
    {
      number: '6',
      title: 'Marketingové cookies',
      blocks: [
        {
          type: 'p',
          text: 'Marketingové cookies mohou být používány k měření účinnosti marketingových kampaní, vyhodnocování konverzí, správě reklamních kampaní nebo zobrazování relevantnějšího obsahu uživatelům.',
        },
        {
          type: 'p',
          text: 'Marketingové cookies používáme pouze na základě souhlasu uživatele. Uživatel může souhlas s marketingovými cookies kdykoliv odmítnout, změnit nebo odvolat prostřednictvím nastavení cookies.',
        },
        {
          type: 'p',
          text: 'V první verzi webových stránek nebo služby AuditReady nemusí být marketingové cookies používány. Pokud marketingové cookies nebudou používány, nebude tato kategorie aktivní nebo bude v cookie liště označena jako nepoužívaná.',
        },
        {
          type: 'p',
          text: 'Pokud budou v budoucnu marketingové cookies nasazeny, bude přehled používaných cookies aktualizován tak, aby obsahoval název cookie, poskytovatele, účel a dobu uchování.',
        },
      ],
    },
    {
      number: '7',
      title: 'Správa souhlasu s cookies',
      blocks: [
        {
          type: 'p',
          text: 'Při první návštěvě webových stránek AuditReady může být uživateli zobrazena cookie lišta, která umožňuje rozhodnout o používání volitelných cookies.',
        },
        { type: 'p', text: 'Cookie lišta by měla uživateli umožnit zejména:' },
        {
          type: 'list',
          items: [
            'přijmout všechny volitelné cookies,',
            'odmítnout všechny volitelné cookies,',
            'nastavit jednotlivé kategorie cookies podle vlastní volby.',
          ],
        },
        {
          type: 'p',
          text: 'Nezbytné cookies nelze prostřednictvím cookie lišty vypnout, protože jsou potřebné pro fungování webových stránek nebo webové aplikace. Analytické a marketingové cookies se používají pouze tehdy, pokud k nim uživatel udělí souhlas.',
        },
        {
          type: 'p',
          text: 'Uživatel může svůj souhlas kdykoliv změnit nebo odvolat prostřednictvím odkazu „Nastavení cookies“, který by měl být dostupný na webových stránkách, například v patičce webu.',
        },
        {
          type: 'p',
          text: 'Odmítnutí volitelných cookies nemá vliv na možnost používat webové stránky nebo službu AuditReady, může však ovlivnit některé doplňkové funkce, měření návštěvnosti, optimalizaci obsahu nebo vyhodnocování kampaní.',
        },
      ],
    },
    {
      number: '8',
      title: 'Přehled používaných cookies',
      blocks: [
        {
          type: 'p',
          text: 'Níže je uveden aktuální přehled cookies a obdobných technologií, které mohou být používány na webových stránkách nebo ve webové aplikaci AuditReady podle současné technické implementace. Přehled bude průběžně aktualizován, pokud se změní používané technologie, analytické nebo marketingové nástroje.',
        },
        {
          type: 'table',
          headers: ['Název cookie / technologie', 'Kategorie', 'Poskytovatel', 'Účel'],
          rows: [
            [
              'auditready_consent',
              'Preferenční',
              'AuditReady',
              'Ukládá nastavení a preference souhlasu s cookies.',
            ],
            [
              'checklist_access_token',
              'Nezbytné',
              'AuditReady',
              'Slouží pro přihlášení uživatele a správu uživatelské relace.',
            ],
            [
              'mfa_challenge_token',
              'Nezbytné',
              'AuditReady',
              'Slouží k bezpečnostní ochraně formulářů a procesu vícefaktorového ověření (MFA).',
            ],
            [
              'stripe_cookies*',
              'Marketingové',
              'Stripe',
              'Mohou sloužit k měření kampaní, konverzí nebo remarketingu, pokud jsou tyto funkce používány a pokud k tomu uživatel udělil souhlas.',
            ],
            [
              'user_language_preference',
              'Preferenční',
              'AuditReady',
              'Ukládá uživatelské preference, například jazykové nastavení.',
            ],
          ],
          footnote:
            '* Označení stripe_cookies je souhrnné. Konkrétní názvy cookies nebo obdobných technologií Stripe se mohou lišit podle aktuální implementace platebních, konverzních nebo marketingových funkcí.',
        },
        {
          type: 'p',
          text: 'Před spuštěním webu a při každé významnější změně aplikace doporučujeme provést technickou kontrolu skutečně používaných cookies. Přehled musí odpovídat tomu, co je reálně nasazeno na webu a ve webové aplikaci. Marketingové cookies a související měření se používají pouze v rozsahu odpovídajícím udělenému souhlasu uživatele.',
        },
      ],
    },
    {
      number: '9',
      title: 'Nastavení cookies v prohlížeči',
      blocks: [
        {
          type: 'p',
          text: 'Uživatel může cookies spravovat také prostřednictvím nastavení svého internetového prohlížeče. V prohlížeči je obvykle možné cookies blokovat, mazat nebo nastavit pravidla pro jejich ukládání.',
        },
        {
          type: 'p',
          text: 'Pokud uživatel zakáže všechny cookies v nastavení prohlížeče, mohou být některé části webových stránek nebo webové aplikace AuditReady nefunkční nebo omezené. To se může týkat zejména přihlášení, zabezpečených částí aplikace, ukládání voleb nebo správného fungování formulářů.',
        },
        {
          type: 'p',
          text: 'Nastavení cookies v prohlížeči je nezávislé na nastavení souhlasu prostřednictvím cookie lišty. Odvolání souhlasu v cookie liště se vztahuje na používání volitelných cookies ze strany webových stránek AuditReady, zatímco nastavení prohlížeče může technicky ovlivnit ukládání cookies obecně.',
        },
      ],
    },
    {
      number: '10',
      title: 'Změny těchto zásad',
      blocks: [
        {
          type: 'p',
          text: 'Tyto zásady používání cookies můžeme průběžně aktualizovat, zejména v souvislosti se změnami webových stránek, webové aplikace, používaných technologií, analytických nebo marketingových nástrojů, právních požadavků nebo dodavatelů.',
        },
        {
          type: 'p',
          text: 'Aktuální znění těchto zásad bude vždy dostupné na webových stránkách AuditReady. Pokud dojde k podstatné změně používání cookies, můžeme uživatele informovat také prostřednictvím cookie lišty, oznámení na webu nebo jiným vhodným způsobem.',
        },
        {
          type: 'p',
          text: 'Změny těchto zásad nabývají účinnosti dnem jejich zveřejnění, pokud není uvedeno jinak.',
        },
      ],
    },
    {
      number: '11',
      title: 'Kontaktní údaje',
      blocks: [
        {
          type: 'p',
          text: 'V případě dotazů týkajících se používání cookies, nastavení souhlasu nebo zpracování osobních údajů nás můžete kontaktovat na níže uvedené adrese:',
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

const en: CookiesContent = {
  title: 'AuditReady Cookie Policy',
  intro: [
    {
      type: 'p',
      text: 'This document describes how AuditReady s.r.o. uses cookies and similar technologies on the AuditReady website and web application.',
    },
  ],
  sections: [
    {
      number: '1',
      title: 'General information',
      blocks: [
        {
          type: 'p',
          text: 'This cookie policy explains how we use cookies and similar technologies in connection with the operation of the website, the web application and the online services provided under the AuditReady brand.',
        },
        { type: 'p', text: 'The operator of the AuditReady website and service is:' },
        {
          type: 'p',
          text: 'AuditReady s.r.o., with its registered office at Francouzská 312/100, Vršovice, 101 00 Prague 10, Company ID (IČO): 06584128, registered in the Commercial Register kept by the Municipal Court in Prague, section C, file 284828, e-mail: info@auditready.cz.',
        },
        {
          type: 'p',
          text: 'This policy applies to the use of cookies and similar technologies when visiting the AuditReady website, using the web application, managing a user account and using AuditReady online services.',
        },
        {
          type: 'p',
          text: 'More detailed information about the processing of personal data is set out in the separate Privacy Policy available on the AuditReady website.',
        },
      ],
    },
    {
      number: '2',
      title: 'What cookies and similar technologies are',
      blocks: [
        {
          type: 'p',
          text: 'Cookies are small text files that may be stored on the user\u2019s device, such as a computer, phone or tablet, when visiting a website. Cookies allow the website or application to recognise the user\u2019s device, remember certain preferences, ensure the proper functioning of the service or obtain information about how the website is being used.',
        },
        {
          type: 'p',
          text: 'In addition to cookies, similar technologies may also be used, such as local storage, session storage or other technical mechanisms for storing information in the browser. For simplicity, all of these technologies are jointly referred to as "cookies" in this policy, unless expressly stated otherwise.',
        },
        {
          type: 'p',
          text: 'Cookies may be temporary, i.e. stored only for the duration of a website visit or browser session, or persistent, remaining on the user\u2019s device for a certain period or until they are removed by the user.',
        },
        {
          type: 'p',
          text: 'Some cookies are necessary for the proper functioning of the website or application. Other cookies, such as analytics or marketing cookies, are used only if the user grants consent through the cookie banner or another consent management tool.',
        },
      ],
    },
    {
      number: '3',
      title: 'Types of cookies we use',
      blocks: [
        {
          type: 'p',
          text: 'On the AuditReady website and web application we may use the following basic categories of cookies:',
        },
        {
          number: '3.1',
          title: 'Necessary cookies',
          blocks: [
            {
              type: 'p',
              text: 'Necessary cookies are required for the basic functioning of the website and web application. Without these cookies, some parts of the service may not work correctly. These cookies are used, for example, to ensure security, manage logins, store cookie settings, protect against misuse and ensure the technical operation of the service.',
            },
          ],
        },
        {
          number: '3.2',
          title: 'Analytics cookies',
          blocks: [
            {
              type: 'p',
              text: 'Analytics cookies help us understand how users interact with the website, which parts of the site are being visited and how the service can be improved. We use analytics cookies only on the basis of the user\u2019s consent.',
            },
          ],
        },
        {
          number: '3.3',
          title: 'Marketing cookies',
          blocks: [
            {
              type: 'p',
              text: 'Marketing cookies may be used to measure the effectiveness of campaigns, evaluate conversions or display more relevant content. We use marketing cookies only on the basis of the user\u2019s consent. If marketing cookies are not currently in use, this category will be listed in the cookie settings as unused or will not be active.',
            },
          ],
        },
        {
          number: '3.4',
          title: 'Preference cookies',
          blocks: [
            {
              type: 'p',
              text: 'Preference cookies may be used to remember user choices, such as language settings, chosen display options or other user preferences. Where these cookies are necessary for the functioning of the service or for storing the user\u2019s choice, they may be included among the necessary cookies. Where they serve only to make use of the website more convenient, they may be used according to the user\u2019s consent settings.',
            },
          ],
        },
      ],
    },
    {
      number: '4',
      title: 'Necessary cookies',
      blocks: [
        {
          type: 'p',
          text: 'We use necessary cookies so that the AuditReady website and web application can function correctly and securely. These cookies are usually set in response to an action by the user, such as logging in, submitting a form, configuring cookie preferences or using a secured part of the application.',
        },
        { type: 'p', text: 'Necessary cookies may serve in particular the following purposes:' },
        {
          type: 'list',
          items: [
            'ensuring the basic functioning of the website and the application,',
            'managing the user session and login,',
            'protecting against unauthorised access and misuse of the service,',
            'storing cookie consent settings,',
            'security protection of forms and the user account,',
            'technical operation of the service.',
          ],
        },
        {
          type: 'p',
          text: 'The use of necessary cookies is not subject to user consent, as they are required for the provision of the service or to ensure its secure operation. The user may disable them in the browser settings, but in that case the website or the web application may not function correctly.',
        },
      ],
    },
    {
      number: '5',
      title: 'Analytics cookies',
      blocks: [
        {
          type: 'p',
          text: 'Analytics cookies may be used to measure website traffic, evaluate the use of the site, improve content, optimise the user experience and determine whether the website and its individual parts are clear and effective for users.',
        },
        {
          type: 'p',
          text: 'We use analytics cookies only if the user grants consent through the cookie banner or another consent management tool. If the user does not grant consent or later withdraws it, analytics cookies will not be actively used.',
        },
        {
          type: 'p',
          text: 'Analytics tools may process in particular information about the website visit, such as pages visited, duration of the visit, technical information about the device and browser, approximate location derived from the IP address or information about the source from which the user reached the website.',
        },
        {
          type: 'p',
          text: 'The specific analytics tool and specific cookies will be added in line with the actual implementation of the website. If analytics cookies are used, they will be listed in the overview of cookies used or directly in the cookie banner settings.',
        },
      ],
    },
    {
      number: '6',
      title: 'Marketing cookies',
      blocks: [
        {
          type: 'p',
          text: 'Marketing cookies may be used to measure the effectiveness of marketing campaigns, evaluate conversions, manage advertising campaigns or display more relevant content to users.',
        },
        {
          type: 'p',
          text: 'We use marketing cookies only on the basis of the user\u2019s consent. The user can refuse, change or withdraw consent to marketing cookies at any time through the cookie settings.',
        },
        {
          type: 'p',
          text: 'In the first version of the AuditReady website or service, marketing cookies may not be in use. If marketing cookies are not in use, this category will not be active or will be marked as unused in the cookie banner.',
        },
        {
          type: 'p',
          text: 'If marketing cookies are deployed in the future, the overview of cookies used will be updated to include the cookie name, provider, purpose and retention period.',
        },
      ],
    },
    {
      number: '7',
      title: 'Cookie consent management',
      blocks: [
        {
          type: 'p',
          text: 'On the first visit to the AuditReady website, the user may be shown a cookie banner that allows them to decide about the use of optional cookies.',
        },
        { type: 'p', text: 'The cookie banner should in particular allow the user to:' },
        {
          type: 'list',
          items: [
            'accept all optional cookies,',
            'reject all optional cookies,',
            'configure individual categories of cookies as the user prefers.',
          ],
        },
        {
          type: 'p',
          text: 'Necessary cookies cannot be disabled through the cookie banner because they are required for the functioning of the website or the web application. Analytics and marketing cookies are used only if the user grants consent for them.',
        },
        {
          type: 'p',
          text: 'The user can change or withdraw their consent at any time through the "Cookie settings" link, which should be available on the website, for example in the website footer.',
        },
        {
          type: 'p',
          text: 'Rejecting optional cookies does not affect the ability to use the AuditReady website or service, but it may affect some additional features, traffic measurement, content optimisation or campaign evaluation.',
        },
      ],
    },
    {
      number: '8',
      title: 'Overview of cookies used',
      blocks: [
        {
          type: 'p',
          text: 'Below is the current overview of cookies and similar technologies that may be used on the AuditReady website or web application according to the current technical implementation. The overview will be updated from time to time if the technologies, analytics or marketing tools used change.',
        },
        {
          type: 'table',
          headers: ['Cookie / technology name', 'Category', 'Provider', 'Purpose'],
          rows: [
            [
              'auditready_consent',
              'Preference',
              'AuditReady',
              'Stores cookie consent settings and preferences.',
            ],
            [
              'checklist_access_token',
              'Necessary',
              'AuditReady',
              'Used for user login and session management.',
            ],
            [
              'mfa_challenge_token',
              'Necessary',
              'AuditReady',
              'Used for security protection of forms and the multi-factor authentication (MFA) flow.',
            ],
            [
              'stripe_cookies*',
              'Marketing',
              'Stripe',
              'May be used for campaign measurement, conversions or remarketing where those functions are in use and the user has given consent.',
            ],
            [
              'user_language_preference',
              'Preference',
              'AuditReady',
              'Stores user preferences, such as language settings.',
            ],
          ],
          footnote:
            '* The label "stripe_cookies" is a summary entry. The specific cookies or similar technologies provided by Stripe may differ depending on the current implementation of payment, conversion or marketing features.',
        },
        {
          type: 'p',
          text: 'Before launching the website and on every significant change to the application, we recommend a technical review of the cookies actually in use. The overview must match what is actually deployed on the website and in the web application. Marketing cookies and related measurement are used only to the extent that matches the user\u2019s consent.',
        },
      ],
    },
    {
      number: '9',
      title: 'Cookie settings in the browser',
      blocks: [
        {
          type: 'p',
          text: 'The user can also manage cookies through the settings of their internet browser. In the browser, it is usually possible to block or delete cookies or to set rules for storing them.',
        },
        {
          type: 'p',
          text: 'If the user disables all cookies in the browser settings, some parts of the AuditReady website or web application may not work or may be limited. This may in particular affect login, secured parts of the application, storage of preferences or the correct functioning of forms.',
        },
        {
          type: 'p',
          text: 'Browser cookie settings are independent of consent settings managed through the cookie banner. Withdrawing consent in the cookie banner applies to the use of optional cookies by the AuditReady website, while browser settings may technically affect the storage of cookies in general.',
        },
      ],
    },
    {
      number: '10',
      title: 'Changes to this policy',
      blocks: [
        {
          type: 'p',
          text: 'We may update this cookie policy from time to time, in particular in connection with changes to the website, the web application, the technologies used, the analytics or marketing tools used, legal requirements or suppliers.',
        },
        {
          type: 'p',
          text: 'The current version of this policy will always be available on the AuditReady website. If there is a material change in the use of cookies, we may also inform the user through the cookie banner, a notice on the website or in another appropriate manner.',
        },
        {
          type: 'p',
          text: 'Changes to this policy take effect on the date of their publication, unless stated otherwise.',
        },
      ],
    },
    {
      number: '11',
      title: 'Contact details',
      blocks: [
        {
          type: 'p',
          text: 'If you have any questions regarding the use of cookies, consent settings or the processing of personal data, you can contact us at the address below:',
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

export const cookiesContent: Record<Locale, CookiesContent> = {
  cs,
  en,
};
