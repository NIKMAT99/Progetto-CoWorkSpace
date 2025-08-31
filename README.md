
# CoWorkSpace - Piattaforma di Prenotazione Spazi Lavoro

CoWorkSpace è un'applicazione web full-stack che consente agli utenti di trovare, prenotare e gestire spazi di coworking. La piattaforma è progettata per professionisti e team, offrendo diverse tipologie di spazi come scrivanie singole, uffici privati e sale riunioni.

## Indice

- [Caratteristiche Principali](#caratteristiche-principali)
- [Stack Tecnologico](#stack-tecnologico)
- [Struttura del Progetto](#struttura-del-progetto)
- [Prerequisiti](#prerequisiti)
- [Installazione e Avvio Locale](#installazione-e-avvio-locale)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Documentazione Tecnica](#documentazione-tecnica)
  - [Schema del Database (ER)](#schema-del-database-er)
  - [Specifiche API](#specifiche-api)
  - [Gestione degli Errori e Rollback](#gestione-degli-errori-e-rollback)
- [Istruzioni per il Deploy (Render)](#istruzioni-per-il-deploy-render)
  - [Deploy del Database PostgreSQL](#deploy-del-database-postgresql)
  - [Deploy del Backend](#deploy-del-backend)
  - [Deploy del Frontend](#deploy-del-frontend)

## Caratteristiche Principali

-   **Autenticazione Utenti**: Registrazione e login sicuri con JWT (JSON Web Tokens).
-   **Gestione Ruoli**: Distinzione tra utenti standard e amministratori con permessi differenti.
-   **Visualizzazione Sedi e Spazi**: Catalogo delle sedi di coworking e degli spazi disponibili con dettagli e immagini.
-   **Sistema di Prenotazione**: Funzionalità per prenotare spazi per date e orari specifici.
-   **Carrello e Checkout**: Gli utenti possono aggiungere più prenotazioni al carrello e "pagarle" in un'unica transazione.
-   **Dashboard Utente**: Area riservata per visualizzare e gestire le proprie prenotazioni.
-   **Pannello Admin**: Interfaccia per amministratori per la gestione di sedi, spazi e utenti (funzionalità di base).

## Stack Tecnologico

-   **Backend**:
    -   **Framework**: Node.js, Express.js
    -   **Database**: PostgreSQL
    -   **Autenticazione**: JSON Web Token (jsonwebtoken), bcrypt
    -   **Driver DB**: `pg`
    -   **Altro**: `dotenv` per le variabili d'ambiente, `cors` per la gestione delle richieste cross-origin.

-   **Frontend**:
    -   **Core**: HTML5, CSS3, JavaScript (ES6+)
    -   **Framework CSS**: Bootstrap 5
    -   **Librerie**: Font Awesome per le icone.

## Struttura del Progetto

Il progetto è diviso in due directory principali:

-   `coworkspace-backend/`: Contiene l'applicazione server-side Node.js/Express.
    -   `controllers/`: Logica di business per ogni rotta.
    -   `middleware/`: Funzioni intermedie (es. verifica token, controllo ruoli).
    -   `routes/`: Definizione degli endpoint API.
    -   `app.js`: Entry point dell'applicazione backend.
    -   `db.js`: Configurazione della connessione al database.
-   `coworkspace-frontend/`: Contiene i file statici per l'interfaccia utente.
    -   `assets/`: Contiene i file CSS, JavaScript e immagini.
    -   `*.html`: Pagine HTML dell'applicazione (login, dashboard, etc.).

---

## Prerequisiti

Prima di iniziare, assicurati di avere installato:

-   [Node.js](https://nodejs.org/) (versione 18.x o successiva)
-   [PostgreSQL](https://www.postgresql.org/download/) (un'istanza locale o su cloud)

## Installazione e Avvio Locale

### Backend

1.  **Clona il repository:**
    ```bash
    git clone <URL_DEL_TUO_REPOSITORY>
    cd Progetto-CoWorkSpace
    ```

2.  **Naviga nella cartella del backend e installa le dipendenze:**
    ```bash
    cd coworkspace-backend
    ```
    ```bash
    npm install
    ```

3.  **Configura il database:**
    -   Accedi a PostgreSQL e crea un nuovo database.
      ```sql
      CREATE DATABASE coworkspace_db;
      ```
    -   Esegui lo script SQL per creare le tabelle necessarie. Puoi usare il seguente schema:
      ```sql
      -- Script per la creazione delle tabelle
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user' NOT NULL, -- 'user' o 'admin'
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE locations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          city VARCHAR(100),
          description TEXT,
          image_url VARCHAR(255)
      );

      CREATE TABLE spaces (
          id SERIAL PRIMARY KEY,
          location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
          type VARCHAR(100) NOT NULL, -- Es. 'Scrivania', 'Ufficio Privato', 'Sala Riunioni'
          capacity INTEGER DEFAULT 1,
          price DECIMAL(10, 2) NOT NULL, -- Prezzo orario
          image_url VARCHAR(255)
      );

      CREATE TABLE reservations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          status VARCHAR(50) DEFAULT 'confermata',
          paid BOOLEAN DEFAULT FALSE,
          paid_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(space_id, date, start_time) -- Vincolo per evitare sovrapposizioni
      );
      ```

4.  **Crea il file di ambiente:**
    -   Nella cartella `coworkspace-backend`, crea un file `.env`.
    -   Aggiungi le seguenti variabili, personalizzandole con i tuoi dati:
      ```env
      # File: coworkspace-backend/.env
      DB_USER=postgres
      DB_HOST=localhost
      DB_DATABASE=coworkspace_db
      DB_PASSWORD=tua_password_db
      DB_PORT=5432

      JWT_SECRET=la_tua_chiave_segreta_per_jwt
      ```

5.  **Avvia il server backend:**
    ```bash
    node app.js
    ```
    Il server sarà in ascolto sulla porta `3000` (o quella definita in `app.js`).

### Frontend

Il frontend è composto da file statici e non richiede un processo di build.

1.  **Configura l'URL dell'API:**
    -   Nel frontend, i file JavaScript che effettuano chiamate API (es. `assets/js/auth.js`, `assets/js/reservations.js`) devono puntare all'URL corretto del backend.
    -   Assicurati che le chiamate `fetch` utilizzino l'indirizzo del tuo server locale (es. `http://localhost:3000/api/...`).

2.  **Apri i file HTML nel browser:**
    -   Puoi aprire direttamente il file `coworkspace-frontend/index.html` nel tuo browser.
    -   Per un'esperienza migliore e per evitare problemi con le policy CORS, è consigliabile servire i file tramite un server web locale. Se hai VS Code, puoi usare l'estensione "Live Server".

---

## Documentazione Tecnica

### Schema del Database (ER)

Il database è strutturato in quattro tabelle principali:

-   **`users`**: Memorizza le informazioni degli utenti, inclusi i dati per l'autenticazione e il ruolo.
-   **`locations`**: Contiene i dettagli delle diverse sedi di coworking.
-   **`spaces`**: Dettaglia gli spazi di lavoro disponibili in ogni sede, con tipo, capacità e prezzo.
-   **`reservations`**: Traccia le prenotazioni effettuate dagli utenti per specifici spazi, date e orari. Include lo stato del pagamento.

**Relazioni:**
-   `locations` 1-a-N `spaces`: Una sede può avere molti spazi.
-   `users` 1-a-N `reservations`: Un utente può effettuare molte prenotazioni.
-   `spaces` 1-a-N `reservations`: Uno spazio può avere molte prenotazioni.

### Specifiche API

Tutti gli endpoint sono prefissati con `/api`. Le rotte che richiedono autenticazione devono includere un `Authorization: Bearer <token>` header.

| Metodo | Endpoint                  | Descrizione                                                              | Autenticazione |
| :----- | :------------------------ | :----------------------------------------------------------------------- | :------------- |
| POST   | `/auth/register`          | Registra un nuovo utente.                                                | No             |
| POST   | `/auth/login`             | Effettua il login e restituisce un token JWT.                            | No             |
| GET    | `/users/me`               | Restituisce i dati dell'utente loggato.                                   | Sì             |
| GET    | `/locations`              | Ottiene la lista di tutte le sedi.                                       | No             |
| GET    | `/locations/:id`          | Ottiene i dettagli di una sede specifica.                                | No             |
| GET    | `/spaces`                 | Ottiene la lista di tutti gli spazi (con filtri opzionali).              | No             |
| GET    | `/spaces/:id`             | Ottiene i dettagli di uno spazio specifico.                              | No             |
| POST   | `/reservations`           | Crea una nuova prenotazione.                                             | Sì             |
| GET    | `/reservations`           | Ottiene le prenotazioni dell'utente loggato.                              | Sì             |
| GET    | `/cart`                   | Ottiene il carrello dell'utente (prenotazioni non pagate).               | Sì             |
| POST   | `/cart/checkout`          | "Paga" tutte le prenotazioni nel carrello, marcandole come `paid=TRUE`.  | Sì             |

### Gestione degli Errori e Rollback

-   **Gestione Errori**: L'API segue un approccio standardizzato. In caso di successo, restituisce un codice `2xx` con i dati richiesti. In caso di errore (es. input non valido, risorsa non trovata, errore del server), restituisce un codice `4xx` o `5xx` con un oggetto JSON contenente un messaggio di errore:
    ```json
    {
        "message": "Descrizione dell'errore",
        "error": "Dettaglio tecnico (opzionale)"
    }
    ```
-   **Rollback Transazionale**: Le operazioni critiche che modificano più record del database (come il checkout del carrello o la creazione di una prenotazione complessa) sono avvolte in transazioni SQL (`BEGIN`, `COMMIT`, `ROLLBACK`). Se una qualsiasi parte dell'operazione fallisce, tutte le modifiche vengono annullate (`ROLLBACK`), garantendo la consistenza dei dati.

---

## Istruzioni per il Deploy (Render)

Render è una piattaforma cloud ideale per deployare applicazioni full-stack. Divideremo il deploy in tre parti: Database, Backend e Frontend.

### 1. Deploy del Database PostgreSQL

1.  Accedi al tuo account Render e vai alla Dashboard.
2.  Clicca su **New +** e seleziona **PostgreSQL**.
3.  Assegna un nome al database (es. `coworkspace-db`), scegli una regione e clicca su **Create Database**.
4.  Attendi che il database sia pronto. Una volta disponibile, vai alla pagina del database e copia l'**Internal Connection String**. Ti servirà per il backend.
5.  Usa un client SQL (come DBeaver o pgAdmin) per connetterti al database di Render usando le credenziali fornite e esegui lo script SQL fornito nella sezione [Configura il database](#installazione-e-avvio-locale).

