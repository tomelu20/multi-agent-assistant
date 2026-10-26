# Multi-Agent Personal Productivity Assistant - Thesis Documentation

## 1. Problema și Cui i Se Adresează Aplicația
Această aplicație își propune să rezolve fragmentarea cronică a fluxurilor de lucru personale, o problemă accentuată de utilizarea disjunctă a diverselor platforme digitale pentru calendar, administrarea task-urilor și documente. Utilizatorii moderni se confruntă frecvent cu supraîncărcare cognitivă, fiind nevoiți să comute constant între aplicații pentru a sincroniza un program de lucru, a extrage sarcini din notițe nestructurate sau a planifica obiective pe termen scurt. Aplicația se adresează în primul rând studenților, cercetătorilor și profesioniștilor cu un volum ridicat de activități zilnice care necesită coordonare precisă între calendar și managementul sarcinilor.

Prin intermediul unei abordări bazate pe agenți specializați, sistemul automatizează descompunerea obiectivelor complexe în pași logici, reducând timpul pierdut cu operațiuni administrative repetitive. De asemenea, aplicația rezolvă problema lipsei de transparență și a lipsei de control din asistenții clasici de tip "black-box", implementând mecanisme stricte de aprobare umană (*human-in-the-loop*) înainte de orice modificare a stării externe (creare de evenimente sau task-uri). Pentru referințe suplimentare privind impactul fragmentării digitale asupra productivității, consultați [Harvard Business Review on Collaboration Overload](https://hbr.org/2018/01/collaborative-overload) și studiile academice referitoare la gestionarea timpului pe [ACM Digital Library](https://dl.acm.org/).

## 2. Documentare și Stadiul Actual al Tehnologiei (State-of-the-Art)
În peisajul actual al productivității digitale, soluții precum Notion AI, Reclaim.ai sau Motion încearcă să automatizeze planificarea prin algoritmi bazați pe reguli sau modele generative liniare. Cu toate acestea, aceste aplicații prezintă limitări majore: sunt adesea proprietare, oferă un control redus asupra modului în care deciziile sunt luate de către sistem, manifestă un risc ridicat de "halucinație" în execuția automată a sarcinilor și nu permit o descompunere flexibilă, multi-agent, capabilă să colaboreze între domenii izolate (de exemplu, integrarea notițelor nestructurate dintr-un document direct în calendarul personal respectând constrângerile de timp).

Analiza literaturii de specialitate indică o trecere de la arhitecturile monolitice bazate pe un singur prompt către sisteme multi-agent colaborative, inspirate din cadre teoretice precum AutoGen sau LangGraph. Articole de referință privind limitările modelelor autonome și necesitatea supravegherii umane pot fi consultate pe [arXiv: Multi-Agent Systems Survey](https://arxiv.org/) și în articolele de analiză publicate de [IEEE Xplore on Agentic Workflows](https://ieeexplore.ieee.org/). Aceste surse subliniază importanța decuplării planificării de execuția efectivă a uneltelor pentru a preveni buclele infinite și acțiunile nedorite.

## 3. Proiectare, Arhitectură și Tehnologii
Arhitectura sistemului este de tip monorepo și separă clar clientul de server, fiind compusă dintr-o aplicație cross-platform în React Native & Expo (pentru Web și Mobile) și un backend robust realizat în Python cu FastAPI. Motorul de inteligență artificială recomandat și integrat în această aplicație este **Google Gemini 1.5 Pro** (alături de **Gemini 1.5 Flash** pentru rutare rapidă), ales datorită ferestrei sale masive de context (ce permite preluarea istoricului lung al documentelor și a întregului calendar fără pierderi), suportului nativ robust pentru apeluri structurate de funcții (*Structured Function Calling* prin scheme Pydantic) și eficienței economice superioare.

Fluxul arhitectural urmează un model ierarhic în care clientul trimite cererea în limbaj natural către Orchestrator (FastAPI), care descompune obiectivul în pași atomici și îi atribuie agenților specializați (Calendar Agent, Task Agent). Stratul de unelte validează fiecare acțiune prin tipuri stricte de date, iar interfața afișează în timp real un jurnal de execuție transparent pentru fiecare decizie a agenților.

## 4. Implementare Proiect
Implementarea este împărțită structural între directorul `/backend` (serviciul FastAPI care găzduiește logica agenților, rutele API și adaptoarele de unelte pentru calendar și task-uri) și directorul `/frontend` (aplicația React Native & Expo care oferă un panou de control unificat pentru utilizator). Comunicarea se realizează prin protocoale HTTP/REST asincrone, iar validarea payload-urilor se face riguros pe ambele capete folosind scheme Pydantic pe server și tipuri TypeScript pe client.

Pe parcursul implementării, s-a pus un accent deosebit pe siguranța datelor și pattern-ul *Human-in-the-Loop*: nicio acțiune de scriere (cum ar fi crearea automată a unui eveniment în calendar sau salvarea unui task) nu este executată direct de către agenți fără acordul explicit și confirmarea vizuală din interfața utilizatorului. Această abordare elimină riscul modificărilor accidentale și garantează controlul complet al utilizatorului asupra fluxului de productivitate.

## 5. Testare și Evaluare (Unit Tests, Research AI & Metrici)
Testarea aplicației combină teste unitare clasice pentru logica deterministă (de exemplu, validarea schemelor Pydantic și funcționarea adaptoarelor de unelte) cu o componentă extinsă de evaluare empirică a comportamentului inteligenței artificiale. Pentru evaluarea riguroasă a performanței LLM-ului utilizat, au fost concepute două idei majore de experiment:
1. *Comparație Single-Agent vs. Multi-Agent:* Măsurarea ratei de succes, a numărului de pași redundanți și a acurateței descompunerii pe un set de 20 de scenarii sintetice de productivitate (ex. planificarea zilei cu conflicte de calendar).
2. *Analiza impactului contextului și a latenței:* Evaluarea timpului mediu de răspuns ($\text{Latency}$) și a consumului de tokeni în funcție de dimensiunea istoricului transmis modelului Gemini.

Din punct de vedere analitic, performanța și costul operațional sunt cuantificate prin formule matematice specifice tezei:
- **Consumul aproximativ de cost estimat ($C$):**
  $$C = (T_{\text{input}} \times P_{\text{input}}) + (T_{\text{output}} \times P_{\text{output}})$$
  unde $T_{\text{input/output}}$ reprezintă numărul de tokeni procesați/generați, iar $P_{\text{input/output}}$ reprezintă prețul per milion de tokeni al modelului Gemini.
- **Rata de succes a execuției task-urilor ($SR$):**
  $$SR = \frac{N_{\text{success}}}{N_{\text{total}}} \times 100$$
  unde $N_{\text{success}}$ este numărul de scenarii finalizate corect fără intervenții manuale de corecție a erorilor de tool calling.

## 6. Concluzii Legate de Aplicație și Teste
Dezvoltarea asistentului personal multi-agent a demonstrat că decuplarea planificării strategice de execuția strict validată a uneltelor crește considerabil fiabilitatea sistemelor bazate pe LLM. Experimentele efectuate au scos în evidență faptul că arhitectura multi-agent reduce substanțial ambiguitatea în sarcinile complexe comparativ cu un singur agent monolitic, oferind în același timp un echilibru excelent între autonomie și controlul utilizatorului.

În ansamblu, aplicația reprezintă o soluție viabilă, scalabilă și sigură pentru automatizarea productivității personale, validând cu succes obiectivele stabilite în cadrul temei de licență.