
const layerOrange = document.getElementById('layer-orange');
const logoLayer = document.getElementById('logo-layer');
const headerCream = document.getElementById('header-cream');
const headerOrange = document.getElementById('header-orange');
const ctaArrow = document.getElementById('cta-arrow');
const storyContent = document.getElementById('story-content');
const subtitles = document.querySelectorAll('.date-subtitle');

const checkMobile = () => window.innerWidth <= 768;

// Variabile per ricordare l'ultima posizione di scroll
// VARIABILI DI STATO SCROLL
let lastScrollTop = 0;
let scrollUpBuffer = 0; // Contatore di pixel verso l'alto
const showThreshold = 150; // SOGLIA: Deve scrollare su di 150px prima che il logo appaia

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const isMobile = checkMobile();

    // 1. CALCOLO DIREZIONE E BUFFER
    // Calcoliamo la differenza rispetto all'ultimo frame
    const diff = lastScrollTop - scrollY;
    const isScrollingDown = scrollY > lastScrollTop;

    // Gestione Buffer per la sensibilità
    if (isScrollingDown) {
        // Se scende, azzeriamo il contatore di risalita
        scrollUpBuffer = 0;
    } else {
        // Se sale, accumuliamo i pixel percorsi
        scrollUpBuffer += diff;
    }

    // Aggiorniamo subito l'ultima posizione
    lastScrollTop = scrollY <= 0 ? 0 : scrollY;

    // ... (CALCOLI PROGRESS - QUESTA PARTE RIMANE IDENTICA) ...
    const animationDistance = windowHeight * 1.5;
    let progress = scrollY / animationDistance;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // A. FRECCIA E DATA
    let fadeOut = 1 - (scrollY / 100);
    if (fadeOut < 0) fadeOut = 0;
    ctaArrow.style.opacity = fadeOut;
    subtitles.forEach(el => el.style.opacity = fadeOut);

    // B. MOVIMENTO E CERCHIO
    let activeProgress = 0;
    if (progress > 0.05) {
        activeProgress = (progress - 0.05) / 0.7;
        if (activeProgress > 1) activeProgress = 1;
    }

    const startScale = 1;
    const endScale = isMobile ? 0.8 : 0.3;
    const endLeft = isMobile ? 50 : 1.5;
    const endTop = isMobile ? 7 : 3;
    const startTranslateX = -50;
    const endTranslateX = isMobile ? -50 : 0;

    const currentScale = startScale - (activeProgress * (startScale - endScale));
    const currentTranslateX = startTranslateX + (activeProgress * (endTranslateX - startTranslateX));
    const currentTranslateY = -50 + (activeProgress * 50);

    const currentLeft = 50 - (activeProgress * (50 - endLeft));
    const currentTop = 50 - (activeProgress * (50 - endTop));

    const transformStyle = `translate(${currentTranslateX}%, ${currentTranslateY}%) scale(${currentScale})`;

    // APPLICAZIONE STILI AI LOGHI
    [headerCream, headerOrange].forEach(header => {
        header.style.top = `${currentTop}%`;
        header.style.left = `${currentLeft}%`;
        header.style.transform = transformStyle;

        // --- GESTIONE LOGO (Scomparsa + Colore) ---

        // Applichiamo la logica SOLO se l'intro è finita (logo posizionato)
        if (activeProgress > 0.95) {

            // 1. LOGICA SCOMPARSA (MOBILE)
            if (isMobile) {
                if (isScrollingDown) header.classList.add('header-hidden');
                else if (scrollUpBuffer > showThreshold) header.classList.remove('header-hidden');
            }

            // 2. LOGICA CAMBIO COLORE (DESKTOP & MOBILE)
            // Calcoliamo le coordinate pixel dove si trova il logo in questo momento
            // Mobile: Centro-Alto (50% w, 7% h) | Desktop: Sinistra-Alto (3% w, 3% h)
            // Usiamo window.innerWidth per convertire le % in pixel

            let checkX, checkY;

            if (isMobile) {
                checkX = windowWidth * 0.5; // Centro
                checkY = windowHeight * 0.08; // Un po' sotto il bordo alto (8%)
            } else {
                checkX = windowWidth * 0.05; // Un po' a destra del bordo (5%)
                checkY = windowHeight * 0.05; // Un po' sotto il bordo alto (5%)
            }

            const elementsUnder = document.elementsFromPoint(checkX, checkY);

            // Cerchiamo l'elemento che è una SEZIONE (o è dentro una sezione)
            let sectionBelow = null;

            for (let el of elementsUnder) {
                // Ignoriamo il logo stesso e i suoi contenitori
                if (el.closest('#logo-layer') || el.closest('.sync-header')) continue;

                // Se troviamo una sezione, ci fermiamo
                let foundSection = el.closest('section');
                if (foundSection) {
                    sectionBelow = foundSection;
                    break;
                }
            }

            // Se troviamo una sezione e questa è "theme-light" (sfondo chiaro)
            if (sectionBelow && sectionBelow.classList.contains('theme-light')) {
                // Attiviamo il logo scuro
                headerOrange.classList.add('logo-dark-mode');
            } else {
                // Altrimenti (sfondo scuro o nessuna sezione) logo bianco
                headerOrange.classList.remove('logo-dark-mode');
            }

        } else {
            // Durante l'intro:
            header.classList.remove('header-hidden');
            headerOrange.classList.remove('logo-dark-mode');
        }
    });

    // Apertura Cerchio
    const maxRadius = Math.hypot(windowWidth, windowHeight);
    const currentRadius = activeProgress * maxRadius * 1.2;
    const clipStyle = `circle(${currentRadius}px at 50% 90%)`;
    layerOrange.style.clipPath = clipStyle;
    logoLayer.style.clipPath = clipStyle;

    // C. APPARIZIONE CONTENUTO
    if (progress > 0.4) {
        let opac = (progress - 0.4) * 3;
        if (opac > 1) opac = 1;
        storyContent.style.opacity = opac;
    } else {
        storyContent.style.opacity = 0;
    }
});

function startStory() {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
}

// --- CARICAMENTO SVG ---
const monvisoBox = document.getElementById('monviso-box');
fetch('images/MappaMonviso.svg')
    .then(response => response.text())
    .then(svgCode => {
        monvisoBox.innerHTML = svgCode;
        const svgElement = monvisoBox.querySelector('svg');
        if (svgElement) svgElement.classList.add('svg-map');
        initMapAnimation();
    })
    .catch(error => console.error('Errore SVG:', error));

function initMapAnimation() {
    const mountainGroup = monvisoBox.querySelector('#Monviso');
    const textGroup = monvisoBox.querySelector('#Testo');
    const lineGroup = monvisoBox.querySelector('#Linea');
    const originalPath = lineGroup ? lineGroup.querySelector('path') : null;
    const svgElement = monvisoBox.querySelector('svg');

    if (!mountainGroup || !originalPath || !svgElement) return;

    // --- 1. CONFIGURAZIONE STILE (SPESSORE E TRATTEGGIO) ---

    // MANOPOLA 1: SPESSORE LINEA
    // Cambia "4px" con quello che vuoi (più alto = più spessa)
    originalPath.style.strokeWidth = "5px";

    // MANOPOLA 2: TRATTEGGIO
    // "10, 10" = 10px linea, 10px vuoto
    originalPath.style.strokeDasharray = "12, 12";

    originalPath.style.opacity = "1";

    // --- 2. CREAZIONE MASCHERA (Tecnica per animare il tratteggio) ---
    const maskId = 'lineMask';
    let defs = svgElement.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svgElement.prepend(defs);
    }
    const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute("id", maskId);

    const maskPath = originalPath.cloneNode(true);
    const lineLength = originalPath.getTotalLength();

    // La maschera deve essere solida e bianca per rivelare
    maskPath.style.stroke = "white";
    maskPath.style.strokeWidth = originalPath.style.strokeWidth; // Copia lo spessore
    maskPath.style.strokeDasharray = lineLength; // Niente tratteggio sulla maschera
    maskPath.style.strokeDashoffset = lineLength; // Parte nascosta
    maskPath.removeAttribute('id');
    maskPath.removeAttribute('class');

    mask.appendChild(maskPath);
    defs.appendChild(mask);
    originalPath.setAttribute("mask", `url(#${maskId})`);

    // --- 3. GESTIONE SCROLL SINCRONIZZATA ---
    window.addEventListener('scroll', () => {
        const boxRect = monvisoBox.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Definizione area di scroll per l'animazione
        const startPoint = windowHeight;
        // MANOPOLA 3: VELOCITÀ GENERALE
        // 0.0 = Animazione finisce quando il box tocca la cima dello schermo
        // -0.2 = Finisce ancora dopo (più lento)
        const endPoint = windowHeight * 0.15;

        const scrollRange = startPoint - endPoint;
        let currentPos = startPoint - boxRect.top;

        // PROGRESSO GENERALE (da 0.0 a 1.0)
        let mainProgress = currentPos / scrollRange;
        if (mainProgress < 0) mainProgress = 0;
        if (mainProgress > 1) mainProgress = 1;


        // --- A. ANIMAZIONE LINEA (Segue tutto il progresso) ---
        const drawOffset = lineLength - (mainProgress * lineLength);
        maskPath.style.strokeDashoffset = drawOffset;


        // --- B. ANIMAZIONE MONTAGNA (Più lenta, ma finisce prima) ---
        // Vogliamo che la montagna finisca di apparire quando siamo al 70% della linea.
        // Quindi scaliamo il progresso: (mainProgress / 0.7)
        let mountainProgress = mainProgress / 0.8;
        if (mountainProgress > 1) mountainProgress = 1;

        // Calcoliamo la percentuale di taglio (clip)
        // 100% = tutto nascosto, 0% = tutto visibile
        let clipValue = 100 - (mountainProgress * 100);
        mountainGroup.style.clipPath = `inset(0 ${clipValue}% 0 0)`;


        // --- C. ANIMAZIONE TESTO (Solo alla fine) ---
        // Appare solo se la linea ha FINITO (progresso > 0.99)
        if (mainProgress > 0.99 && textGroup) {
            textGroup.classList.add('active');
        } else if (textGroup) {
            // Opzionale: se torni su, il testo scompare
            textGroup.classList.remove('active');
        }
    });
}

// --- SIDE NAV ---
function initSideNav() {
    const sections = document.querySelectorAll('.track-section');
    const navContainer = document.querySelector('#side-nav ul');
    const sideNav = document.getElementById('side-nav'); // Riferimento al contenitore

    if (sections.length === 0 || !navContainer) return;

    // Creazione pallini (Codice invariato)
    // Pulisci prima per evitare duplicati se la funzione viene richiamata
    navContainer.innerHTML = '';

    sections.forEach((section, index) => {
        const li = document.createElement('li');
        const dot = document.createElement('div');
        dot.classList.add('nav-dot');
        const title = section.getAttribute('data-title') || `Sezione ${index + 1}`;
        li.setAttribute('data-label', title);
        li.appendChild(dot);
        navContainer.appendChild(li);
        li.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    // --- OBSERVER AGGIORNATO ---
    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Attiva quando la sezione è al centro
        threshold: 0
    };

    const navItems = document.querySelectorAll('#side-nav li');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 1. Attiva il pallino giusto
                navItems.forEach(item => item.classList.remove('active'));
                const index = Array.from(sections).indexOf(entry.target);
                if (index >= 0 && navItems[index]) navItems[index].classList.add('active');

                // 2. GESTIONE COLORE PALLINI (Nuovo)
                // Controlla se la sezione attiva è Chiara o Scura
                if (entry.target.classList.contains('theme-light')) {
                    // Se siamo su sfondo chiaro -> Pallini scuri
                    sideNav.classList.add('nav-dark-mode');
                } else {
                    // Altrimenti (scuro o default) -> Pallini bianchi
                    sideNav.classList.remove('nav-dark-mode');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Gestione visibilità generale allo scroll (invariata)
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        if (scrollY > windowHeight * 0.8) sideNav.classList.add('visible');
        else sideNav.classList.remove('visible');
    });
}
document.addEventListener('DOMContentLoaded', initSideNav);

// --- 5. GESTIONE RSVP FORM ---
const scriptURL = 'https://script.google.com/macros/s/AKfycbxiZ26fK1wA1HjZ_VvuFjxiZCTp27qwA5frUomI4_nmnifUnqpg3jVO9DBlhzEY9MitJA/exec'; // <--- MODIFICA QUI
const form = document.forms['submit-to-google-sheet'];
const msg = document.getElementById('form-message');
const btn = document.getElementById('btn-submit');

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();

        // Effetto caricamento
        btn.innerHTML = "INVIO IN CORSO...";
        btn.style.opacity = "0.7";

        fetch(scriptURL, { method: 'POST', body: new FormData(form) })
            .then(response => {
                msg.innerHTML = "Grazie! La tua risposta è stata registrata! 🧡";
                msg.style.color = "white";
                btn.innerHTML = "INVIATO!";
                btn.style.backgroundColor = "#4CAF50"; // Verde successo

                // Reset form dopo 3 secondi
                setTimeout(() => {
                    form.reset();
                    btn.innerHTML = "CONFERMA";
                    btn.style.backgroundColor = ""; // Torna marrone
                    btn.style.opacity = "1";
                    msg.innerHTML = "";
                }, 5000);
            })
            .catch(error => {
                msg.innerHTML = "Ops! Qualcosa è andato storto. Riprova.";
                msg.style.color = "#ffcccc";
                btn.innerHTML = "RIPROVA";
                console.error('Error!', error.message);
            });
    });
}

// --- 6. ANIMAZIONE GENERALE BLOCCHI (Reveal on Scroll) ---
function initBlockAnimations() {
    // Seleziona tutti gli elementi che devono essere animati
    const revealBlocks = document.querySelectorAll('.reveal-block');

    // Se non ce ne sono, esci
    if (revealBlocks.length === 0) return;

    const observerOptions = {
        root: null,
        // Attiva l'animazione quando il 20% dell'elemento è visibile dal basso
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px' // Un piccolo margine di sicurezza
    };

    const blockObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Se l'elemento entra nello schermo
            if (entry.isIntersecting) {
                // Aggiungi la classe .active che fa partire l'animazione CSS
                entry.target.classList.add('active');
                // Smetti di osservarlo (l'animazione avviene una volta sola)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Inizia ad osservare ogni blocco
    revealBlocks.forEach(block => blockObserver.observe(block));
}

initBlockAnimations();

// --- 7. GESTIONE COORDINATE BANCARIE ---

// Toggle (Mostra/Nascondi)
const btnBank = document.getElementById('btn-toggle-bank');
const bankContainer = document.getElementById('bank-details-container');

if (btnBank && bankContainer) {
    btnBank.addEventListener('click', () => {
        const isVisible = bankContainer.classList.contains('visible');

        if (isVisible) {
            // Chiudi
            bankContainer.classList.remove('visible');
            btnBank.textContent = "Mostra coordinate bancarie";
            btnBank.classList.remove('active'); // Rimuovi stile attivo
        } else {
            // Apri
            bankContainer.classList.add('visible');
            btnBank.textContent = "Nascondi coordinate";
            btnBank.classList.add('active'); // Aggiungi stile attivo (pieno)
        }
    });
}

// Funzione di Copia
// Nota: La rendiamo globale attaccandola a window per poterla chiamare dall'HTML
window.copyToClipboard = function (elementId, btnElement) {
    const textToCopy = document.getElementById(elementId).innerText;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Feedback visivo: cambio icona temporaneo
        const originalIcon = btnElement.innerHTML;

        // Icona di spunta (Check)
        btnElement.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;color:${btnElement.classList.contains('white-icon') ? 'white' : '#4CAF50'}"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        setTimeout(() => {
            btnElement.innerHTML = originalIcon;
        }, 2000);
    }).catch(err => {
        console.error('Errore nella copia: ', err);
        alert('Impossibile copiare automaticamente. Seleziona il testo manualmente.');
    });
};


// --- 9. CARICATORE SVG + SCROLL ANIMATION ---
const cloudWrapper = document.getElementById('svg-cloud-wrapper');

if (cloudWrapper) {
    const svgPath = cloudWrapper.getAttribute('data-src');

    // Caricamento file
    fetch(svgPath)
        .then(res => {
            if (!res.ok) throw new Error("File SVG non trovato o errore CORS");
            return res.text();
        })
        .then(svgCode => {
            // Inserimento SVG
            cloudWrapper.innerHTML = svgCode;
            console.log("SVG Nuvole caricato con successo!");

            // Correzione attributi per visualizzazione corretta
            const svgEl = cloudWrapper.querySelector('svg');
            if (svgEl) {
                svgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                svgEl.style.overflow = 'visible'; // Fondamentale per farle uscire
            }

            // Avvio logica scroll
            initCloudScroll();
        })
        .catch(err => {
            console.error("ERRORE CARICAMENTO NUVOLE:", err);
            console.warn("SUGGERIMENTO: Se sei in locale (file://), usa VS Code Live Server.");
        });
}

function initCloudScroll() {
        const section = document.getElementById('sec-intro');
        const sx1 = document.getElementById('nuv-sx1');
        const sx2 = document.getElementById('nuv-sx2');
        const dx1 = document.getElementById('nuv-dx1');
        const dx2 = document.getElementById('nuv-dx2');

        if (!section || !sx1) return;

        // RILEVAMENTO MOBILE
        const isMobile = window.innerWidth <= 768;

        // --- CONFIGURAZIONE DIFFERENZIATA ---
        
        // 1. SCALA (Dimensione)
        // Desktop: 0.6 (60%) | Mobile: 1.1 (110% - Molto più grandi)
        const scaleVal = isMobile ? 1.1 : 0.6; 
        const initialScale = `scale(${scaleVal})`;

        // 2. BUFFER (Ritardo avvio)
        // Desktop: -300 (come hai testato tu) | Mobile: 0 (parte subito o quasi)
        const startBuffer = isMobile ? -550 : -300;

        // 3. VELOCITÀ
        // Su mobile lo schermo è più corto, quindi magari serve un po' meno velocità per godersi l'animazione
        const speed = isMobile ? 1.2 : 1.2;

        // ------------------------------------

        const handleMove = () => {
            const rect = section.getBoundingClientRect();
            
            // Calcolo quanto siamo scesi rispetto all'inizio della sezione
            let scrolledPast = -rect.top;

            // Applichiamo il buffer
            // Se startBuffer è negativo (es. -300), aggiungiamo 300 al calcolo, anticipando l'apertura
            let activeScroll = scrolledPast - startBuffer;
            
            // Evitiamo valori negativi che potrebbero invertire l'animazione
            if (activeScroll < 0) activeScroll = 0;

            const moveX = activeScroll * speed;

            // Applichiamo movimento + LA SCALA GIUSTA PER IL DISPOSITIVO
            if(sx1) sx1.style.transform = `translateX(-${moveX}px) ${initialScale}`;
            if(sx2) sx2.style.transform = `translateX(-${moveX * 0.7}px) ${initialScale}`; 
            
            if(dx1) dx1.style.transform = `translateX(${moveX}px) ${initialScale}`;
            if(dx2) dx2.style.transform = `translateX(${moveX * 0.7}px) ${initialScale}`; 
        };

        // Reset iniziale e avvio listener
        handleMove();
        window.addEventListener('scroll', handleMove);
        
        // Aggiorna se l'utente ruota il telefono
        window.addEventListener('resize', () => {
            // Un semplice reload della pagina o ricalcolo potrebbe servire qui, 
            // ma per ora lasciamo che mantenga la logica iniziale per semplicità.
        });
    }