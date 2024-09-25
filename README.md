# Hvordan applikationen fungerer
### - Login
Indtast en email og adgangskode på login-siden for at komme videre. Hvis loginoplysningerne er forkerte, vises en fejlbesked.

* Klik på "Hint"-knappen på login-siden for at se de aktuelle tilgængelige brugere.

Men ellers er de:

| **Email**             | **Password** | **Role** |
|-----------------------|--------------|----------|
| jensen@mail.dk        | citron       | Admin    |
| hansen@mail.dk        | appelsin     | Bruger   |
| pedersen@mail.dk      | abrikos      | Bruger   |


### - Dashboard
Når du er logget ind, bliver du omdirigeret til "dashboarded", som er beskyttet af en route guard.

Her kan du følge de nuværende projekter.
Klik på "tasks" knappen for at se hvilke der hører til det specifikke projekt. Hvis den er tom, kan en medarbejder 'assign' sig selv på den, og derefter opdatere status som er henholdsvis "Todo", "In-progress", "Finished". Den farvede kugle indikerer hvor langt task'en er nået.


*OBS: Jeg har lavet det således at alle projekter og tasks er synlige, så medarbejderen kan påtage sig frie tasks. Det strider liidt imod opgaveformuleringen, men var sådan jeg først forstod det.*

### - Admin
* Kan oprette projekter, samt slette dem.
* Kan oprette tasks, samt sætte medarbejder på, under skabelsen.
* Kan også sætte sig selv på tasks.

### Hvad kan forbedres?
* Admin bør kunne tvinge folk på 'assignments' efter oprettelsen af en task
* Brugere skal måske ikke kunne se projekter som de ikke er 'assigned' til

Overordnet forventer min version af programmet nok, at medarbejderne er lidt for fair når det kommer til at selv vælge hvad man laver :D


## Backend
### - Auth
Igennem Firebase Authentication bliver der knyttet et unikt ID til hver bruger – dette ID bruges som dokument-ID i en 'users' Collection for at finde ud af, om den indloggede email tilhører en admin eller ej. 

| Document ID [Users]                  | mail  | admin             |
|--------------------------------------|-------|------------------|
| MLFmH8PmCBPhzI6EwnQ9dKUUt3I3         | jensen@mail.dk   | true   |
| 1eNuD2emCKavggVggoVaZYk2dQF2         | hansen@mail.dk | false   |

### - Struktur i Firebase

- **Projects** (Collection)
  - **Document**: Project
    - **SubCollection**: Tasks
      - **Task Document**: Task
      - **Task Document**: Task

### Realtime Updates
Alt skulle gerne opdateres i realtime :)