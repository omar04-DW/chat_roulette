# ⚔️ MYSTERIUM — The Arena of Secrets

Jeu multijoueur en ligne avec rooms privées. Style futuriste + Empire Romain.

## 🔥 Setup Firebase (5 minutes)

### 1. Créer le projet Firebase
1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
2. Clique **"Ajouter un projet"** → donne un nom → Créer
3. Dans la page du projet, clique **"Ajouter une application"** → Web (icône `</>`)
4. Donne un nom → **Enregistrer** → **copie la config** (apiKey, authDomain, etc.)

### 2. Activer Auth anonyme
1. Menu gauche → **Authentication** → **Commencer**
2. Onglet **"Sign-in method"** → **Anonyme** → **Activer** → Enregistrer

### 3. Créer Firestore
1. Menu gauche → **Firestore Database** → **Créer une base de données**
2. Choisis **"mode test"** → Suivant → Créer
3. Va dans **Règles** et colle :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Configurer le projet
```bash
cp .env.example .env
```
Remplis `.env` avec les valeurs de ta config Firebase.

## 🚀 Lancer

```bash
npm install
npm run dev
```

Ouvre le lien affiché → crée une arène → partage le code avec tes amis !

## 🎮 Règles
- 3 à 13 joueurs
- Chacun écrit une question anonyme
- Un MC tourne la roue du destin
- Le joueur choisi : répondre ou accuser (1 accusation par partie)
- Si l'accusation est correcte → échappé ! Sinon → doit répondre
