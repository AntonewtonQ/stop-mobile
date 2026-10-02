import type { Locale } from '@/i18n/dictionaries';

export const PRIVACY_POLICY_URL = 'https://jogastop.ao/privacidade';
export const PRIVACY_CONTACT_EMAIL = 'antonewtonquima@gmail.com';

export type PrivacySection = {
  id: string;
  title: string;
  body: string[];
  items?: string[];
  links?: { label: string; href: string }[];
};

export type PrivacyPolicyCopy = {
  badge: string;
  title: string;
  intro: string;
  updated: string;
  backHome: string;
  overviewLabel: string;
  overview: { title: string; body: string }[];
  contents: string;
  noteTitle: string;
  noteBody: string;
  sections: PrivacySection[];
  publicPolicy: string;
  openLinkError: string;
  footer: string;
};

const pt: PrivacyPolicyCopy = {
  badge: 'Privacidade e consentimento',
  title: 'Política de Privacidade do jogastop',
  intro:
    'Como Antonewton Quima e Adilson Fernandes tratam os dados do jogastop no site, na PWA instalada pelo navegador e na aplicação nativa para Android e iOS. As funcionalidades e os serviços de terceiros não são iguais em todas as plataformas.',
  updated: 'Última actualização: 29 de Setembro de 2026',
  backHome: 'Voltar ao jogo',
  overviewLabel: 'Em resumo',
  overview: [
    {
      title: 'Joga com um apelido',
      body: 'Não precisas de criar conta. O nome escolhido identifica-te na sala e pode aparecer no ranking público.',
    },
    {
      title: 'Dados para jogar em conjunto',
      body: 'A API guarda salas, respostas, votos e resultados para sincronizar a partida e permitir a reconexão.',
    },
    {
      title: 'Mobile e web são diferentes',
      body: 'A versão nativa actual não integra anúncios nem SDK de analytics. O site e a PWA utilizam serviços web de publicidade e medição.',
    },
  ],
  contents: 'Nesta página',
  noteTitle: 'Protege os teus dados',
  noteBody:
    'Usa um apelido. Não escrevas contactos, palavras-passe ou dados sensíveis nas respostas e categorias. Partilha o código da sala apenas com quem queres jogar e nunca partilhes o token da tua sessão.',
  sections: [
    {
      id: 'ambito',
      title: '1. Responsáveis e âmbito',
      body: [
        'Antonewton Quima e Adilson Fernandes são responsáveis pelo tratamento dos dados do jogo jogastop. Esta política abrange o site jogastop.ao, a PWA e a aplicação nativa Android/iOS, que comunicam com a mesma API de jogo.',
        'Instalar o site através do navegador continua a ser usar a versão web. A aplicação nativa é distinta: não incorpora o AdSense nem o Vercel Web Analytics. Se abrires o site a partir da app, passam a aplicar-se as práticas web nessa página.',
      ],
    },
    {
      id: 'dados',
      title: '2. Dados utilizados',
      body: [
        'Tratamos as informações fornecidas ao jogar e os dados técnicos necessários à ligação:',
      ],
      items: [
        'Nome ou apelido, avatar predefinido, iniciais e cor de perfil. Não pedimos nome legal, e-mail ou telefone para jogar.',
        'Identificadores de jogador e de sessão, código e configurações da sala, ordem dos jogadores, presença e momento da última ligação.',
        'Categorias, letras, respostas enviadas, votos e respectivos autores, pontuações, vencedores e histórico das rodadas.',
        'Sessão de reconexão e preferências locais de idioma, tema e som.',
        'Dados técnicos de pedidos à API, como endereço IP, informação do cliente, horários, estado do pedido e erros, que a infraestrutura pode processar ou registar.',
        'Apenas no site/PWA: dados de navegação, eventos de utilização e dados relacionados com publicidade, descritos na secção 5.',
      ],
    },
    {
      id: 'finalidades',
      title: '3. Finalidades e acesso',
      body: [
        'Os dados de jogo permitem criar e sincronizar salas, autenticar acções, guardar respostas, calcular pontos, votar, recuperar sessões e detectar jogadores desligados. Também são usados no ranking semanal público.',
        'O painel administrativo protegido apresenta actividade de salas, jogadores online, nomes de anfitriões, estatísticas de partidas e erros recentes para operação, segurança e diagnóstico. Estas estatísticas do servidor abrangem ambas as plataformas, mesmo sem analytics na app nativa.',
        'Não vendemos dados pessoais. O alojamento da API e os fornecedores da base de dados processam dados para prestar o serviço. O site utiliza também Vercel Web Analytics e Google AdSense. Os fornecedores podem processar dados fora do teu país.',
      ],
    },
    {
      id: 'armazenamento',
      title: '4. Armazenamento e segurança',
      body: [
        'Salas, jogadores, respostas, votos e resultados ficam na base de dados da API. Em produção, a comunicação com jogastop.ao utiliza HTTPS. O servidor guarda uma versão hash do token de sessão para autenticar acções.',
        'Na app nativa, a sessão e o token de reconexão ficam no SecureStore: Keychain no iOS e armazenamento cifrado protegido pelo Android Keystore no Android. As preferências e o código da última sala ficam no AsyncStorage. Na actualização, as sessões antigas válidas são migradas; a cópia anterior só é removida depois de a gravação segura ter sucesso. Se o armazenamento seguro falhar, a app não guarda novos tokens em texto simples.',
        'No site/PWA, a sessão e preferências ficam no armazenamento do navegador. A PWA guarda páginas da interface e recursos estáticos em cache; os pedidos à API com o estado das partidas não são guardados nessa cache. O jogo online continua a exigir ligação.',
      ],
    },
    {
      id: 'publicidade',
      title: '5. Apenas web/PWA: analytics, anúncios e consentimento',
      body: [
        'No site/PWA, o Vercel Web Analytics mede páginas visitadas, origem do tráfego, país aproximado e características do dispositivo e navegador. Segundo a Vercel, esta medição não utiliza cookies. Os caminhos das páginas podem incluir o código da sala.',
        'Também enviamos eventos de criação e entrada em salas, STOP, votação e falhas de ligação, com duração dos pedidos, estado e contagens de jogadores ou categorias. Não incluímos o conteúdo das respostas nem o token de sessão nestes eventos.',
        'O site integra Google AdSense. A Google e os parceiros identificados na mensagem de consentimento podem usar cookies, armazenamento local e identificadores para apresentar e medir anúncios, consoante as escolhas e regras aplicáveis.',
        'No EEE, Reino Unido e Suíça, a publicidade está sujeita às escolhas de consentimento aplicáveis. Quando a mensagem de consentimento da Google for apresentada, podes aceitar, recusar ou gerir as opções e rever as escolhas através dos controlos de privacidade dessa mensagem. Ler esta política, instalar ou jogar não equivale a consentir em publicidade personalizada.',
        'A app nativa actual não contém AdSense, AdMob, Vercel Web Analytics nem SDK de rastreamento publicitário. Não usa cookies publicitários nas suas ecrãs nativos. Isto não elimina os dados de jogo e registos técnicos tratados pela API.',
      ],
      links: [
        {
          label: 'Privacidade do Vercel Web Analytics',
          href: 'https://vercel.com/docs/analytics/privacy-policy',
        },
        {
          label: 'Como a Google usa dados de sites e apps parceiros',
          href: 'https://policies.google.com/technologies/partner-sites',
        },
      ],
    },
    {
      id: 'partilha',
      title: '6. Salas, ranking e partilhas',
      body: [
        'O código ou link permite consultar informações da sala, incluindo nomes, avatares, presença, progresso e pontuação. Não trates a sala como um espaço confidencial. As respostas da rodada em curso não são mostradas aos outros enquanto o relógio decorre; depois ficam disponíveis para resultados e votação. Os votos e quem já votou são visíveis nessa fase.',
        'O ranking semanal no site é público e inclui nomes escolhidos, pontos, vitórias e partidas concluídas, entre outras estatísticas de jogo. Usa os resultados ainda conservados de partidas concluídas na janela dos últimos sete dias e agrupa nomes iguais; não comprova a identidade de uma pessoa.',
        'Só quando accionas uma partilha enviamos o convite ou resumo para a aplicação escolhida. O convite inclui o código/link da sala; o cartão de resultados, quando disponível, pode incluir nomes e pontuações. WhatsApp e outras apps tratam o que partilhas segundo as suas próprias políticas.',
      ],
    },
    {
      id: 'permissoes',
      title: '7. Permissões da app nativa',
      body: [
        'As funcionalidades actuais não pedem acesso à câmara, microfone, contactos ou localização precisa. Os avatares são predefinidos; os sons de início, últimos segundos e STOP são reproduzidos sem gravar áudio.',
        'Convidar pelo WhatsApp ou pelo menu de partilha abre a aplicação escolhida, sem ler a tua lista de contactos. As permissões dessa aplicação externa são geridas separadamente.',
      ],
    },
    {
      id: 'conservacao',
      title: '8. Conservação e remoção',
      body: [
        'A base de dados é persistente: reiniciar ou publicar uma nova versão não apaga automaticamente as partidas. A limpeza considera a última actualização da sala e não elimina salas com jogadores com presença recente.',
        'Por defeito, salas não concluídas tornam-se elegíveis para limpeza após 24 horas sem actualizações; salas concluídas, após 7 dias. Estes limites são configuráveis no servidor. A remoção ocorre quando a tarefa de limpeza é executada com sucesso, não necessariamente no instante em que o prazo termina.',
        'A limpeza elimina a sala e os respectivos registos de jogadores, rodadas, respostas e votos. O ranking é calculado a partir das partidas ainda existentes. Registos de infraestrutura, métricas e eventuais cópias de segurança têm ciclos próprios do fornecedor; não são eliminados por limpar os dados locais.',
        'As preferências e dados locais permanecem até serem removidos por ti ou pelo sistema. No navegador, podes limpar os dados do site. No Android, podes limpar o armazenamento nas definições da app. No iOS, as credenciais no Keychain podem persistir após apagar a app; desinstalar não garante a sua eliminação. As sessões seguras são vinculadas ao dispositivo, mas cópias de segurança do sistema podem repor preferências e dados locais de versões antigas.',
        'Sair da sala, apagar a app ou limpar o navegador não elimina os dados já enviados ao servidor. Apagar a sessão local pode impedir a reconexão como o mesmo jogador.',
      ],
    },
    {
      id: 'contacto',
      title: '9. Pedidos de privacidade',
      body: [
        'Podes contactar Antonewton Quima e Adilson Fernandes pelo e-mail abaixo para pedir esclarecimentos e, conforme a legislação aplicável, acesso, correcção ou eliminação dos dados associados a ti. Não existe conta obrigatória nem botão de eliminação imediata de dados no servidor.',
        'Ao enviares um pedido por e-mail, os responsáveis recebem o teu endereço e o conteúdo da mensagem para analisar e responder ao pedido. O serviço de correio também processa essa comunicação.',
        'Para localizar a partida, indica apenas o apelido usado, código da sala e data aproximada. Não envies palavras-passe, tokens de sessão nem dados de outros jogadores. Poderemos precisar de confirmar que os dados te dizem respeito antes de executar o pedido.',
      ],
      links: [{ label: PRIVACY_CONTACT_EMAIL, href: `mailto:${PRIVACY_CONTACT_EMAIL}` }],
    },
    {
      id: 'menores',
      title: '10. Menores e alterações',
      body: [
        'O jogo não pede data de nascimento. Menores devem jogar com acompanhamento de um adulto e usar um apelido, sem partilhar dados pessoais nas respostas.',
        'Actualizaremos esta política quando mudarem as funcionalidades ou os serviços de tratamento de dados. A data no início identifica esta versão; a versão pública está disponível em jogastop.ao/privacidade.',
      ],
    },
  ],
  publicPolicy: 'Abrir política em jogastop.ao',
  openLinkError:
    'Não foi possível abrir o link. Tenta novamente ou consulta jogastop.ao/privacidade no navegador.',
  footer: 'jogastop, por Antonewton Quima e Adilson Fernandes. Privacidade no web e no mobile.',
};

const en: PrivacyPolicyCopy = {
  badge: 'Privacy and consent',
  title: 'jogastop Privacy Policy',
  intro:
    'How Antonewton Quima and Adilson Fernandes handle jogastop data on the website, the browser-installed PWA and the native Android and iOS app. Features and third-party services differ across these platforms.',
  updated: 'Last updated: 29 September 2026',
  backHome: 'Back to the game',
  overviewLabel: 'At a glance',
  overview: [
    {
      title: 'Play with a nickname',
      body: 'No account is required. Your chosen name identifies you in the room and may appear on the public leaderboard.',
    },
    {
      title: 'Data for playing together',
      body: 'The API stores rooms, answers, votes and results to synchronise the game and let you reconnect.',
    },
    {
      title: 'Mobile and web are different',
      body: 'The current native app has no integrated ads or analytics SDK. The website and PWA use web advertising and measurement services.',
    },
  ],
  contents: 'On this page',
  noteTitle: 'Protect your information',
  noteBody:
    'Use a nickname. Do not enter contact details, passwords or sensitive information in answers or categories. Only share the room code with people you want to play with, and never share your session token.',
  sections: [
    {
      id: 'ambito',
      title: '1. Controllers and scope',
      body: [
        'Antonewton Quima and Adilson Fernandes are responsible for processing jogastop game data. This policy covers jogastop.ao, the PWA and the native Android/iOS app, which communicate with the same game API.',
        'Installing the website through your browser still uses the web version. The native app is separate: it does not include AdSense or Vercel Web Analytics. If you open the website from the app, the web practices apply to that page.',
      ],
    },
    {
      id: 'dados',
      title: '2. Data we use',
      body: [
        'We process information you provide while playing and technical data needed for the connection:',
      ],
      items: [
        'Your chosen name or nickname, preset avatar, initials and profile colour. No legal name, email address or phone number is required to play.',
        'Player and session identifiers, room code and settings, player order, presence and last connection time.',
        'Categories, letters, submitted answers, votes and their authors, scores, winners and round history.',
        'Reconnection session and local language, theme and sound preferences.',
        'Technical API request data, such as IP address, client information, timestamps, request status and errors, which the infrastructure may process or log.',
        'Website/PWA only: navigation data, usage events and advertising-related data, described in section 5.',
      ],
    },
    {
      id: 'finalidades',
      title: '3. Purposes and access',
      body: [
        'Game data lets us create and synchronise rooms, authenticate actions, save answers, calculate scores, run votes, restore sessions and detect disconnected players. It also supports the public weekly leaderboard.',
        'A protected admin dashboard shows room activity, online players, host names, game statistics and recent errors for operation, security and troubleshooting. These server statistics cover both platforms, even without analytics in the native app.',
        'We do not sell personal data. API hosting and database providers process data to deliver the service. The website also uses Vercel Web Analytics and Google AdSense. Providers may process data outside your country.',
      ],
    },
    {
      id: 'armazenamento',
      title: '4. Storage and security',
      body: [
        'Rooms, players, answers, votes and results are stored in the API database. In production, communication with jogastop.ao uses HTTPS. The server stores a hashed version of the session token to authenticate actions.',
        'In the native app, the session and reconnection token use SecureStore: Keychain on iOS and encrypted storage protected by Android Keystore on Android. Preferences and the last room code use AsyncStorage. On upgrade, valid older sessions are migrated; the previous copy is removed only after secure storage succeeds. If secure storage fails, the app does not save new tokens in plaintext.',
        'On the website/PWA, sessions and preferences use browser storage. The PWA caches interface pages and static resources; API requests containing game state are not stored in that cache. Online gameplay still needs a connection.',
      ],
    },
    {
      id: 'publicidade',
      title: '5. Web/PWA only: analytics, ads and consent',
      body: [
        'On the website/PWA, Vercel Web Analytics measures pages visited, traffic sources, approximate country and device and browser characteristics. According to Vercel, this measurement does not use cookies. Page paths may include the room code.',
        'We also send events for room creation and joining, STOP, voting and connection failures, with request durations, status and counts of players or categories. These events do not include answer contents or session tokens.',
        'The website integrates Google AdSense. Google and the partners identified in the consent message may use cookies, local storage and identifiers to display and measure ads, subject to applicable choices and rules.',
        "In the EEA, UK and Switzerland, advertising is subject to the applicable consent choices. When Google's consent message is displayed, you can accept, reject or manage options and revisit your choices using that message's privacy controls. Reading this policy, installing or playing does not constitute consent to personalised advertising.",
        'The current native app contains no AdSense, AdMob, Vercel Web Analytics or advertising tracking SDK. It does not use advertising cookies on its native screens. This does not remove the game data and technical logs processed by the API.',
      ],
      links: [
        {
          label: 'Vercel Web Analytics privacy information',
          href: 'https://vercel.com/docs/analytics/privacy-policy',
        },
        {
          label: 'How Google uses data from partner sites and apps',
          href: 'https://policies.google.com/technologies/partner-sites',
        },
      ],
    },
    {
      id: 'partilha',
      title: '6. Rooms, leaderboard and sharing',
      body: [
        'A room code or link allows access to room information, including names, avatars, presence, progress and scores. Do not treat a room as a confidential space. Answers in the current round are hidden from others while the timer runs; afterwards they become available for results and voting. Votes and who has voted are visible at that stage.',
        "The website's weekly leaderboard is public and includes chosen names, points, wins and completed games, among other game statistics. It uses retained results of completed games within the last seven days and groups matching names; it does not verify a person's identity.",
        'Only when you initiate sharing do we send the invitation or summary to your chosen app. Invitations include the room code/link; result cards, where available, may include names and scores. WhatsApp and other apps handle what you share under their own policies.',
      ],
    },
    {
      id: 'permissoes',
      title: '7. Native app permissions',
      body: [
        'Current features do not request camera, microphone, contacts or precise location access. Avatars are presets; start, countdown and STOP sounds play without recording audio.',
        'Inviting through WhatsApp or the share menu opens your chosen app without reading your contact list. Permissions for that external app are managed separately.',
      ],
    },
    {
      id: 'conservacao',
      title: '8. Retention and removal',
      body: [
        "The database is persistent: restarting or deploying a new version does not automatically erase games. Cleanup considers the room's last update and does not delete rooms with players whose presence was recently confirmed.",
        'By default, unfinished rooms become eligible for cleanup after 24 hours without updates; finished rooms after 7 days. These limits are configurable on the server. Removal takes place when cleanup runs successfully, not necessarily at the moment the threshold is reached.',
        'Cleanup deletes the room and its player, round, answer and vote records. The leaderboard is calculated from games still stored. Infrastructure logs, metrics and any backups have provider-specific retention cycles; clearing local data does not delete them.',
        'Preferences and local data remain until removed by you or the system. In your browser, clear site data. On Android, clear storage in the app settings. On iOS, Keychain credentials may persist after deleting the app; uninstalling does not guarantee their removal. Secure sessions are tied to the device, but system backups may restore preferences and local data from older versions.',
        'Leaving a room, deleting the app or clearing browser data does not delete data already sent to the server. Deleting the local session may prevent you from reconnecting as the same player.',
      ],
    },
    {
      id: 'contacto',
      title: '9. Privacy requests',
      body: [
        'You can contact Antonewton Quima and Adilson Fernandes at the email below for information and, subject to applicable law, access, correction or deletion of data associated with you. There is no mandatory account or button for immediate server-side data deletion.',
        'When you email a request, the controllers receive your email address and message contents to review and answer it. The email service also processes that communication.',
        "To locate the game, provide only the nickname used, room code and approximate date. Do not send passwords, session tokens or other players' data. We may need to verify that the data relates to you before acting on the request.",
      ],
      links: [{ label: PRIVACY_CONTACT_EMAIL, href: `mailto:${PRIVACY_CONTACT_EMAIL}` }],
    },
    {
      id: 'menores',
      title: '10. Children and changes',
      body: [
        'The game does not ask for a date of birth. Minors should play with adult guidance and use a nickname without sharing personal data in answers.',
        'We will update this policy when features or data-processing services change. The date at the top identifies this version; the public version is available at jogastop.ao/privacidade.',
      ],
    },
  ],
  publicPolicy: 'Open policy on jogastop.ao',
  openLinkError:
    'Could not open the link. Try again or visit jogastop.ao/privacidade in your browser.',
  footer: 'jogastop, by Antonewton Quima and Adilson Fernandes. Privacy on web and mobile.',
};

const fr: PrivacyPolicyCopy = {
  badge: 'Confidentialité et consentement',
  title: 'Politique de confidentialité de jogastop',
  intro:
    "Comment Antonewton Quima et Adilson Fernandes traitent les données de jogastop sur le site, la PWA installée depuis le navigateur et l'application native Android et iOS. Les fonctionnalités et services tiers diffèrent selon la plateforme.",
  updated: 'Dernière mise à jour : 29 septembre 2026',
  backHome: 'Retour au jeu',
  overviewLabel: 'En résumé',
  overview: [
    {
      title: 'Joue avec un pseudo',
      body: "Aucun compte n'est nécessaire. Ton nom choisi t'identifie dans la salle et peut apparaître au classement public.",
    },
    {
      title: 'Des données pour jouer ensemble',
      body: "L'API conserve les salles, réponses, votes et résultats pour synchroniser la partie et permettre la reconnexion.",
    },
    {
      title: 'Mobile et web sont différents',
      body: "L'app native actuelle n'intègre ni publicité ni SDK d'analyse. Le site et la PWA utilisent des services web de publicité et de mesure.",
    },
  ],
  contents: 'Sur cette page',
  noteTitle: 'Protège tes informations',
  noteBody:
    'Utilise un pseudo. Ne saisis pas de coordonnées, mots de passe ou données sensibles dans les réponses ou catégories. Partage le code de salle seulement avec les personnes avec qui tu veux jouer et ne partage jamais ton jeton de session.',
  sections: [
    {
      id: 'ambito',
      title: '1. Responsables et portée',
      body: [
        "Antonewton Quima et Adilson Fernandes sont responsables du traitement des données du jeu jogastop. Cette politique couvre jogastop.ao, la PWA et l'application native Android/iOS, qui communiquent avec la même API de jeu.",
        "Installer le site depuis le navigateur revient à utiliser la version web. L'app native est distincte : elle n'intègre ni AdSense ni Vercel Web Analytics. Si tu ouvres le site depuis l'app, les pratiques web s'appliquent à cette page.",
      ],
    },
    {
      id: 'dados',
      title: '2. Données utilisées',
      body: [
        'Nous traitons les informations fournies pendant le jeu et les données techniques nécessaires à la connexion :',
      ],
      items: [
        "Nom ou pseudo choisi, avatar prédéfini, initiales et couleur du profil. Aucun nom légal, e-mail ou numéro de téléphone n'est demandé pour jouer.",
        'Identifiants du joueur et de session, code et paramètres de salle, ordre des joueurs, présence et heure de dernière connexion.',
        'Catégories, lettres, réponses envoyées, votes et leurs auteurs, scores, gagnants et historique des manches.',
        'Session de reconnexion et préférences locales de langue, thème et son.',
        "Données techniques des requêtes à l'API, comme l'adresse IP, les informations du client, les horaires, le statut des requêtes et les erreurs, que l'infrastructure peut traiter ou journaliser.",
        "Site/PWA uniquement : données de navigation, événements d'utilisation et données publicitaires, décrits dans la section 5.",
      ],
    },
    {
      id: 'finalidades',
      title: '3. Finalités et accès',
      body: [
        'Les données de jeu permettent de créer et synchroniser les salles, authentifier les actions, enregistrer les réponses, calculer les scores, voter, restaurer les sessions et détecter les joueurs déconnectés. Elles servent aussi au classement hebdomadaire public.',
        "Un tableau d'administration protégé affiche l'activité des salles, les joueurs en ligne, les noms des hôtes, les statistiques de parties et les erreurs récentes pour l'exploitation, la sécurité et le diagnostic. Ces statistiques du serveur couvrent les deux plateformes, même sans outil d'analyse dans l'app native.",
        "Nous ne vendons pas de données personnelles. Les prestataires d'hébergement de l'API et de base de données traitent les données pour fournir le service. Le site utilise aussi Vercel Web Analytics et Google AdSense. Les prestataires peuvent traiter des données hors de ton pays.",
      ],
    },
    {
      id: 'armazenamento',
      title: '4. Stockage et sécurité',
      body: [
        "Salles, joueurs, réponses, votes et résultats sont stockés dans la base de données de l'API. En production, la communication avec jogastop.ao utilise HTTPS. Le serveur conserve une version hachée du jeton de session pour authentifier les actions.",
        "Dans l'app native, la session et le jeton de reconnexion utilisent SecureStore : Keychain sur iOS et stockage chiffré protégé par Android Keystore sur Android. Les préférences et le code de la dernière salle utilisent AsyncStorage. Lors de la mise à jour, les anciennes sessions valides sont migrées ; leur copie précédente n'est supprimée qu'après un enregistrement sécurisé réussi. Si le stockage sécurisé échoue, l'app ne sauvegarde pas de nouveaux jetons en clair.",
        "Sur le site/PWA, sessions et préférences utilisent le stockage du navigateur. La PWA met en cache les pages d'interface et ressources statiques ; les requêtes à l'API contenant l'état des parties ne sont pas stockées dans ce cache. Le jeu en ligne nécessite toujours une connexion.",
      ],
    },
    {
      id: 'publicidade',
      title: '5. Web/PWA uniquement : analyse, publicité et consentement',
      body: [
        "Sur le site/PWA, Vercel Web Analytics mesure les pages visitées, les sources du trafic, le pays approximatif et les caractéristiques de l'appareil et du navigateur. Selon Vercel, cette mesure n'utilise pas de cookies. Les chemins des pages peuvent contenir le code de la salle.",
        "Nous envoyons aussi des événements de création et d'entrée dans les salles, de STOP, de vote et d'échec de connexion, avec les durées des requêtes, leur statut et des nombres de joueurs ou catégories. Ces événements ne contiennent ni réponses ni jetons de session.",
        'Le site intègre Google AdSense. Google et les partenaires identifiés dans le message de consentement peuvent utiliser des cookies, le stockage local et des identifiants pour afficher et mesurer les annonces, selon les choix et règles applicables.',
        "Dans l'EEE, au Royaume-Uni et en Suisse, la publicité est soumise aux choix de consentement applicables. Lorsque le message de consentement de Google s'affiche, tu peux accepter, refuser ou gérer les options, puis revoir tes choix dans les contrôles de confidentialité de ce message. Lire cette politique, installer ou jouer ne vaut pas consentement à la publicité personnalisée.",
        "L'app native actuelle ne contient ni AdSense, ni AdMob, ni Vercel Web Analytics, ni SDK de suivi publicitaire. Elle n'utilise pas de cookies publicitaires dans ses écrans natifs. Cela ne supprime pas les données de jeu et journaux techniques traités par l'API.",
      ],
      links: [
        {
          label: 'Confidentialité de Vercel Web Analytics',
          href: 'https://vercel.com/docs/analytics/privacy-policy',
        },
        {
          label: 'Utilisation des données des sites et apps partenaires par Google',
          href: 'https://policies.google.com/technologies/partner-sites',
        },
      ],
    },
    {
      id: 'partilha',
      title: '6. Salles, classement et partage',
      body: [
        'Un code ou lien de salle permet de consulter ses informations, notamment les noms, avatars, présences, progressions et scores. Ne considère pas la salle comme un espace confidentiel. Les réponses de la manche en cours sont masquées aux autres pendant le chronomètre ; elles deviennent ensuite disponibles pour les résultats et votes. Les votes et leurs auteurs sont visibles à ce stade.',
        "Le classement hebdomadaire du site est public et comprend les noms choisis, points, victoires et parties terminées, entre autres statistiques de jeu. Il utilise les résultats encore conservés de parties terminées sur les sept derniers jours et regroupe les noms identiques ; il ne vérifie pas l'identité d'une personne.",
        "Nous envoyons une invitation ou un résumé à l'app choisie uniquement lorsque tu déclenches le partage. L'invitation contient le code/lien de salle ; la carte de résultats, lorsqu'elle est disponible, peut contenir des noms et scores. WhatsApp et les autres apps traitent ce que tu partages selon leurs propres politiques.",
      ],
    },
    {
      id: 'permissoes',
      title: "7. Autorisations de l'app native",
      body: [
        "Les fonctionnalités actuelles ne demandent pas l'accès à la caméra, au microphone, aux contacts ou à la localisation précise. Les avatars sont prédéfinis ; les sons de début, de décompte et de STOP sont lus sans enregistrer d'audio.",
        "Inviter via WhatsApp ou le menu de partage ouvre l'app choisie sans lire ton carnet de contacts. Les autorisations de cette app externe sont gérées séparément.",
      ],
    },
    {
      id: 'conservacao',
      title: '8. Conservation et suppression',
      body: [
        "La base de données est persistante : redémarrer ou publier une nouvelle version n'efface pas automatiquement les parties. Le nettoyage tient compte de la dernière mise à jour de la salle et ne supprime pas les salles avec des joueurs dont la présence a été confirmée récemment.",
        "Par défaut, les salles non terminées deviennent éligibles au nettoyage après 24 heures sans mise à jour ; les salles terminées, après 7 jours. Ces délais sont configurables sur le serveur. La suppression intervient lorsque le nettoyage réussit, pas nécessairement à l'instant où le délai est atteint.",
        "Le nettoyage supprime la salle et ses enregistrements de joueurs, manches, réponses et votes. Le classement est calculé à partir des parties encore conservées. Les journaux d'infrastructure, les mesures et les éventuelles sauvegardes ont des cycles propres aux prestataires ; effacer les données locales ne les supprime pas.",
        "Les préférences et données locales restent jusqu'à leur suppression par toi ou par le système. Dans le navigateur, efface les données du site. Sur Android, efface le stockage dans les paramètres de l'app. Sur iOS, les identifiants Keychain peuvent persister après la suppression de l'app ; la désinstallation ne garantit pas leur effacement. Les sessions sécurisées sont liées à l'appareil, mais des sauvegardes système peuvent restaurer les préférences et données locales d'anciennes versions.",
        "Quitter une salle, supprimer l'app ou effacer le navigateur ne supprime pas les données déjà envoyées au serveur. Supprimer la session locale peut empêcher de revenir comme le même joueur.",
      ],
    },
    {
      id: 'contacto',
      title: '9. Demandes de confidentialité',
      body: [
        "Tu peux contacter Antonewton Quima et Adilson Fernandes par l'e-mail ci-dessous pour demander des informations et, selon la législation applicable, l'accès, la rectification ou la suppression des données te concernant. Il n'y a ni compte obligatoire ni bouton de suppression immédiate des données du serveur.",
        'Si tu envoies une demande par e-mail, les responsables reçoivent ton adresse et le contenu du message pour examiner la demande et y répondre. Le service de messagerie traite aussi cette communication.',
        "Pour retrouver la partie, indique uniquement le pseudo utilisé, le code de salle et la date approximative. N'envoie pas de mots de passe, de jetons de session ou de données d'autres joueurs. Nous pourrons devoir vérifier que les données te concernent avant de traiter la demande.",
      ],
      links: [{ label: PRIVACY_CONTACT_EMAIL, href: `mailto:${PRIVACY_CONTACT_EMAIL}` }],
    },
    {
      id: 'menores',
      title: '10. Mineurs et modifications',
      body: [
        "Le jeu ne demande pas de date de naissance. Les mineurs doivent jouer avec l'accompagnement d'un adulte et utiliser un pseudo, sans partager de données personnelles dans les réponses.",
        'Nous actualiserons cette politique si les fonctionnalités ou services de traitement des données changent. La date en haut identifie cette version ; la version publique est disponible sur jogastop.ao/privacidade.',
      ],
    },
  ],
  publicPolicy: 'Ouvrir la politique sur jogastop.ao',
  openLinkError:
    "Impossible d'ouvrir le lien. Réessaie ou consulte jogastop.ao/privacidade dans ton navigateur.",
  footer: 'jogastop, par Antonewton Quima et Adilson Fernandes. Confidentialité sur web et mobile.',
};

export const privacyPolicies: Record<Locale, PrivacyPolicyCopy> = { pt, en, fr };
