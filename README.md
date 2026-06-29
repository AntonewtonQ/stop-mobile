# jogastop mobile

App mobile do jogastop, construido com React Native, Expo Router e Expo SDK 54.

Este projecto replica a experiencia do web em `/home/aquima/antonewton/stop`, com foco em partidas multiplayer de STOP: criacao de sala, lobby, escolha de letra, ronda, STOP, resultados, votacao e classificacao final.

## Stack

- Expo SDK 54
- React Native 0.81
- Expo Router
- TypeScript
- AsyncStorage para preferencias locais
- expo-audio para sons do jogo
- lucide-react-native para iconografia
- React Query como base para estado remoto

## Requisitos

- Node.js compativel com Expo SDK 54
- npm
- Expo Go ou development build
- Servidor/API do jogastop web em execucao

## Configuracao

Cria um `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Variaveis principais:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
EXPO_PUBLIC_WEB_URL=https://jogastop.ao
```

Usa o IP da maquina na rede local quando fores testar num telemovel fisico. `localhost` normalmente aponta para o proprio telemovel, nao para o computador.

## Instalar

```bash
npm install
```

## Executar

```bash
npm start
```

Depois abre no Expo Go ou usa:

```bash
npm run android
npm run ios
npm run web
```

## Scripts

```bash
npm run typecheck
npm run lint
npm run format
```

## Estrutura

```text
src/app
  Rotas Expo Router: entrada, sala e privacidade.

src/components
  Componentes visuais reutilizaveis: Logo, Button, Input, Card,
  PlayerAvatar, CategoryChip, Timer, ScoreRow, seletores e toggles.

src/features/game
  Tipos, regras, constantes, scoring, engine e API mobile do jogo.

src/features/sounds
  Provider de sons e preferencia persistida.

src/features/privacy
  Conteudo da politica de privacidade em PT, EN e FR.

src/i18n
  Dicionarios e provider de idioma.

src/theme
  Temas Classico, Atlantico, Kizomba e Neon.
```

## Marca

O logotipo real do jogastop esta em:

```text
assets/brand/jogastop-logo-instagram.png
```

Ele foi copiado do projecto web e ja e usado no componente `Logo`, no icone principal do Expo e no favicon web.

## Funcionalidades portadas do web

- Lobby com configuracao de categorias, duracao e numero de rondas.
- Autosave das alteracoes do lobby.
- Indicacao de anfitriao, comandante e estado da sala.
- Convite por WhatsApp e partilha nativa.
- Avatares conceituais.
- Onboarding inicial persistido.
- Temas persistidos.
- Idiomas portugues, ingles e frances.
- Sons de inicio da ronda, ultimos segundos e STOP.
- Ronda com autosave das respostas.
- Resultados, votacao de respostas duvidosas e ranking.
- Tela de privacidade baseada no conteudo do web.

## Notas

- O projecto usa Expo Router, por isso o entrypoint e `expo-router/entry`.
- Se alterares plugins nativos, como `expo-audio`, reinicia o servidor Expo. Em development build, pode ser necessario rebuildar o app.
- Mantem a app mobile alinhada com o web terminado. Quando uma regra mudar no web, verifica primeiro `src/features/game`.
