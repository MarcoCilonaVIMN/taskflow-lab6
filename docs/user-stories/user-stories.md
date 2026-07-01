# User Stories — TaskFlow

## US-1: Lista task

**Come** membro del team, **voglio** vedere l'elenco di tutti i task, **così che** possa avere una visione d'insieme del lavoro da fare.

### Acceptance Criteria

- AC1: La lista mostra titolo, descrizione (se presente) e stato di ogni task.
- AC2: Se non ci sono task, viene mostrato un messaggio esplicativo anziché una lista vuota.
- AC3: La lista si aggiorna automaticamente dopo ogni operazione (creazione, modifica, eliminazione).

---

## US-2: Filtro per stato

**Come** membro del team, **voglio** filtrare i task per stato (todo / in-progress / done), **così che** possa concentrarmi solo sulle attività rilevanti in quel momento.

### Acceptance Criteria

- AC1: Sono disponibili le opzioni di filtro: Tutti, Todo, In Progress, Done.
- AC2: Applicando un filtro, vengono mostrati esclusivamente i task con quello stato.
- AC3: Il filtro attivo è visivamente evidenziato nell'interfaccia.

---

## US-3: Creazione task

**Come** membro del team, **voglio** creare un nuovo task inserendo titolo e descrizione opzionale, **così che** possa tracciare una nuova attività da svolgere.

### Acceptance Criteria

- AC1: Il form richiede almeno il titolo; la creazione è bloccata se il campo è vuoto.
- AC2: Il task creato appare immediatamente nella lista con stato `todo` e data di creazione.
- AC3: In caso di errore di rete o validazione, viene mostrato un messaggio d'errore chiaro.

---

## US-4: Cambio stato

**Come** membro del team, **voglio** aggiornare lo stato di un task, **così che** possa riflettere il progresso reale dell'attività.

### Acceptance Criteria

- AC1: Per ogni task sono disponibili le transizioni di stato ammesse: todo → in-progress → done (e viceversa).
- AC2: Il cambio di stato si riflette immediatamente nell'interfaccia senza ricaricare la pagina.
- AC3: Non è possibile impostare uno stato non valido; il sistema rifiuta la richiesta con un errore esplicito.

---

## US-5: Eliminazione task

**Come** membro del team, **voglio** eliminare un task, **così che** possa rimuovere attività obsolete o create per errore.

### Acceptance Criteria

- AC1: È presente un'azione di eliminazione accessibile direttamente dalla lista.
- AC2: Dopo la conferma, il task scompare dalla lista senza ricaricare la pagina.
- AC3: L'eliminazione di un task inesistente restituisce un errore 404 con messaggio comprensibile.
