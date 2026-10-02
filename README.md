# jogastop mobile

App mobile do jogastop, construido com React Native, Expo Router e Expo SDK 54.

Este projecto replica a experiencia do web em `/home/aquima/antonewton/stop`, com foco em partidas multiplayer de STOP: criacao de sala, lobby, escolha de letra, ronda, STOP, resultados, votacao e classificacao final.

## Stack

- Expo SDK 54
- React Native 0.81
- Expo Router
- TypeScript
- AsyncStorage para preferencias locais
- SecureStore para sessoes nativas e expo-crypto para novos identificadores/tokens
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
npm test
npm run export:check
npm run format
```

## Build Android APK

Para gerar um APK de teste por EAS Internal Distribution:

```bash
npx --yes eas-cli@latest build --platform android --profile preview
```

O perfil `preview` esta configurado em `eas.json` com `android.buildType` como `apk`, entao o resultado e um ficheiro instalavel diretamente em dispositivos Android.

Antes de partilhar com testers, garante que `EXPO_PUBLIC_API_URL` aponta para uma API acessivel pelo telemovel. Para testes fora da tua rede local, usa uma URL publica em vez de IP local.

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

Para mobile, usamos a versao recortada sem wordmark:

```text
assets/brand/jogastop-mobile-mark.png
```

Ela e usada no componente `Logo`, no icone principal do Expo e no favicon web.

## Funcionalidades portadas do web

- Lobby com configuracao de categorias, duracao e numero de rondas.
- Autosave das alteracoes do lobby.
- Indicacao de anfitriao, comandante e estado da sala.
- Convite por WhatsApp e partilha nativa.
- Avatares conceituais.
- Entrada directa, com perfil e tema opcionais e recuperacao da ultima sala.
- Temas persistidos.
- Idiomas portugues, ingles e frances.
- Sons de inicio da ronda, ultimos segundos e STOP.
- Ronda com autosave das respostas.
- Resultados, votacao de respostas duvidosas e ranking.
- Tela de privacidade baseada no conteudo do web.

## Alinhamento mobile com o web

- Convites abrem a entrada da sala mesmo sem uma sessao guardada.
- Durante a rodada, a letra e o relogio ficam no topo e o STOP fica fixo no fundo.
- O teclado permite avancar entre categorias; o rascunho nao e substituido pelo polling.
- Cada rodada tem o seu proprio rascunho. Falhas de autosave sao visiveis e repetidas.
- O progresso dos jogadores, quem parou, quem completou e os votos aparecem na sala.
- O mobile continua a usar as regras e a pontuacao calculadas pela API web.
- As accoes aplicam a sala devolvida pela API imediatamente, sem um GET adicional.
- Leituras nao se sobrepoem. Respostas antigas nao desfazem accoes mais recentes.
- Polling e presenca param em segundo plano e quando se sai do ecra da sala.
- A presenca usa `/presence?light=1`; abrir o teclado ou partilhar um convite nao envia uma saida imediata.

Ainda nao existe paridade total: o ranking semanal publico, o cartao PNG final e a abertura
automatica de links HTTPS no app (Universal Links/App Links) precisam de trabalho proprio.
O esquema `jogastop://sala/CODIGO` ja usa a entrada da sala. Os convites HTTPS continuam
a funcionar na versao web.

## Sessao Segura

Em Android/iOS, a sessao completa, incluindo o token de reconexao, fica no
`expo-secure-store`. O AsyncStorage guarda preferencias e o codigo da ultima sala,
sem novas copias do token. No Expo web, a sessao continua no armazenamento do navegador.

No primeiro acesso ao armazenamento, as sessoes antigas validas sao migradas.
A copia antiga so e removida apos a gravacao segura; uma falha permite repetir a
migracao e nunca provoca fallback para texto simples. Sessoes seguras existentes
prevalecem sobre copias antigas. Registos antigos invalidos sao preservados para
evitar perda de dados; nao sao usados para autenticar.

Leituras e escritas sao serializadas. A sessao e guardada antes de criar/entrar
numa sala na API, evitando perder a credencial se a gravacao local falhar apos a
entrada. Os tokens existentes nao sao alterados; novos tokens usam `expo-crypto`.

O iOS usa `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, sem pedir biometria; o plugin exclui
SecureStore do backup Android. O Keychain iOS pode persistir apos desinstalacao.
Sessoes nao sao garantidas apos troca de dispositivo ou restauro de backup.

E necessario um novo build nativo para incluir `expo-crypto` e a configuracao do
plugin. O bundle JavaScript/export nao substitui esse build nem valida Keychain/Keystore.

## Testes Nas Lojas

O nome apresentado e `jogastop`. Os identificadores Android e iOS estao configurados
como `ao.jogastop.mobile`; confirma que correspondem aos registos das tuas contas
antes da primeira submissao. O projecto EAS e o slug existentes foram mantidos.

O perfil `preview` gera APK para instalacao directa. Para Google Play (teste interno)
e TestFlight, o perfil `store-test` herda as URLs de producao e a versao automatica:

```bash
npx eas-cli build --platform android --profile store-test
npx eas-cli build --platform ios --profile store-test
```

Depois de validar os artefactos, submete o build escolhido pelo seu ID:

```bash
npx eas-cli submit --platform android --profile production --id BUILD_ID
npx eas-cli submit --platform ios --profile production --id BUILD_ID
```

Selecciona o canal de teste interno no Google Play e configura os testers no
App Store Connect. Estes comandos requerem as tuas contas, credenciais de assinatura
e os registos nas lojas. O repositorio nao executa publicacoes automaticamente.
Consulta o [guia de testes mobile](docs/mobile-testing.md) antes de distribuir.

## Notas

- O projecto usa Expo Router, por isso o entrypoint e `expo-router/entry`.
- Se alterares plugins nativos, como `expo-audio`, reinicia o servidor Expo. Em development build, pode ser necessario rebuildar o app.
- Mantem a app mobile alinhada com o web terminado. Quando uma regra mudar no web, verifica primeiro `src/features/game`.
