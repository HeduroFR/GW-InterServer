# InterServer

Passerelle inter-serveurs Discord construite avec [Sapphire Framework](https://www.sapphirejs.dev/) et `discord.js`. Ce bot relie deux salons spécifiques situés dans deux serveurs distincts et transmet les messages (texte + pièces jointes) via des webhooks, en conservant l'avatar et le nom d'affichage de l'auteur.

## Sommaire

- Présentation
- Prérequis
- Installation
- Configuration (`src/.env`)
- Permissions Discord nécessaires
- Démarrage & développement
- Structure du projet
- Fonctionnement de l'inter-serveur
- Déploiement & bonnes pratiques
- Dépannage
- Scripts utiles

## Présentation

InterServer écoute les messages dans deux salons configurés (un par serveur) et les relaie vers l'autre serveur via un webhook, en gérant également l'envoi des pièces jointes. Le listener principal se trouve dans [src/listeners/interServer.ts](src/listeners/interServer.ts).

## Prérequis

- Bun.sh
- Un token de bot Discord valide
- Droits suffisants pour créer/gestionner des webhooks dans les salons ciblés
- Intents activés dans le portail Discord (voir ci-dessous)

## Installation

```bash
bun install
```

## Configuration (`src/.env`)

Les variables d'environnement sont chargées depuis `src/.env` (voir [src/lib/setup.ts](src/lib/setup.ts)). Créez le fichier si nécessaire et renseignez les valeurs ci‑dessous :

```dotenv
# Token du bot Discord
DISCORD_TOKEN=VotreTokenIci

# Identifiants des serveurs et salons à relier
INTER_GREENWOODS_GUILD_ID=123456789012345678
INTER_GREENWOODS_CHANNEL_ID=123456789012345678
INTER_SANCTUAIRE_GUILD_ID=987654321098765432
INTER_SANCTUAIRE_CHANNEL_ID=987654321098765432
```

Conseils :

- N'exposez jamais votre token en clair (ne le commitez pas).
- Les IDs de serveur et de salon peuvent être obtenus en activant le mode développeur dans Discord puis via le clic droit → « Copier l'identifiant ».

## Permissions Discord nécessaires

Le client est initialisé avec les intents suivants (voir [src/index.ts](src/index.ts)) :

- Guilds
- GuildMessages
- MessageContent

Dans le portail développeur Discord, activez l'intent « Message Content » si nécessaire. Donnez au bot la permission « Gérer les webhooks » dans les deux salons ciblés, ainsi que « Lire les messages » et « Joindre des fichiers ».

## Démarrage & développement

Build + start :

```bash
npm run dev
```

Mode watch (rebuild + restart automatique) :

```bash
npm run watch:start
```

Build seul :

```bash
npm run build
```

Démarrage du build :

```bash
npm run start
```

Formatage du code :

```bash
npm run format
```

## Structure du projet

- [src/index.ts](src/index.ts) : création et login du `SapphireClient`.
- [src/lib/setup.ts](src/lib/setup.ts) : chargement des variables d'environnement depuis `src/.env`, configuration du logger, couleurs, etc.
- [src/lib/constants.ts](src/lib/constants.ts) : chemins `rootDir` et `srcDir`.
- [src/listeners/ready.ts](src/listeners/ready.ts) : bannière et debug des stores au démarrage.
- [src/listeners/interServer.ts](src/listeners/interServer.ts) : logique de relais inter-serveurs des messages.
- [src/lib/utils.ts](src/lib/utils.ts) : utilitaires de log pour les commandes (si utilisées).

## Fonctionnement de l'inter-serveur

Le listener [interServer.ts](src/listeners/interServer.ts) :

- Ignore les messages des bots et ceux commençant par `/` ou `!`.
- Vérifie que le message provient d'un des deux salons configurés (`INTER_*_CHANNEL_ID`).
- Récupère/Crée un webhook nommé `InterServerWebhook` sur le salon de destination.
- Transmet le contenu du message et les pièces jointes, en définissant `username` sur `NomDuServeur - AffichageAuteur` et `avatarURL` sur l'avatar de l'auteur.
- Neutralise les mentions (`allowedMentions: { parse: [] }`) pour éviter les pings inter-serveurs.

## Déploiement & bonnes pratiques

- Stockez le token et les IDs dans des variables d'environnement (ne pas commiter `src/.env`).
- Vérifiez que les permissions « Gérer les webhooks » sont accordées au bot sur les salons concernés.
- Gardez vos intents à jour dans le portail Discord.
- Préférez des logs en `production` (voir `NODE_ENV`) et désactivez le mode debug si nécessaire.

## Dépannage

- Rien ne se relaye :
    - Vérifiez les IDs `GUILD_ID`/`CHANNEL_ID` dans `src/.env`.
    - Assurez-vous que le bot voit les messages (droits + intents).
    - Confirmez la permission « Gérer les webhooks » sur le salon de destination.
- Erreur webhooks :
    - Le salon cible doit être un `TextChannel` non DM.
    - Supprimez les webhooks existants si corrompus et laissez le bot les recréer.
- Token invalide :
    - Regénérez le token dans le portail Discord et mettez à jour `DISCORD_TOKEN`.

## Scripts utiles

- `npm run dev` : build puis start.
- `npm run watch:start` : rebuild + restart à chaque changement.
- `npm run build` : compile TypeScript vers `dist`.
- `npm run start` : lance `dist/index.js`.
- `npm run format` : applique Prettier sur `src/`.

## Remerciements

- [Sapphire Framework](https://github.com/sapphiredev/framework)
- [discord.js](https://github.com/discordjs/discord.js)
