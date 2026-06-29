import type { Locale } from '@/i18n/dictionaries';

export type PrivacySection = {
  id: string;
  title: string;
  body: string[];
  items?: string[];
};

export type PrivacyPolicyCopy = {
  badge: string;
  title: string;
  intro: string;
  updated: string;
  backHome: string;
  overviewLabel: string;
  overview: {
    title: string;
    body: string;
  }[];
  contents: string;
  noteTitle: string;
  noteBody: string;
  sections: PrivacySection[];
  googlePrivacy: string;
  footer: string;
};

const pt: PrivacyPolicyCopy = {
  badge: 'Privacidade e consentimento',
  title: 'Joga tranquilo. Os teus dados ficam claros.',
  intro:
    'Esta política explica que informações o jogastop utiliza para criar salas, manter partidas sincronizadas, analisar visitas e apresentar publicidade com respeito pelas tuas escolhas.',
  updated: 'Última actualização: 17 de Junho de 2026',
  backHome: 'Voltar ao jogo',
  overviewLabel: 'Em resumo',
  overview: [
    {
      title: 'Sem conta obrigatória',
      body: 'Podes jogar apenas com um nome ou apelido visível na sala.',
    },
    {
      title: 'Dados para a partida',
      body: 'Guardamos o estado necessário para sincronizar, pontuar e recuperar o jogo.',
    },
    {
      title: 'Tu decides sobre anúncios',
      body: 'Nos territórios aplicáveis, a CMP da Google apresenta as escolhas de consentimento.',
    },
  ],
  contents: 'Nesta página',
  noteTitle: 'Uma recomendação importante',
  noteBody:
    'Usa um apelido e nunca escrevas informações pessoais, palavras-passe ou dados sensíveis nas respostas do jogo.',
  sections: [
    {
      id: 'ambito',
      title: '1. Âmbito desta política',
      body: [
        'Esta política aplica-se ao site e à aplicação instalável jogastop. O jogo permite criar salas temporárias, convidar outras pessoas e disputar rodadas online sem criar uma conta.',
        'O jogastop é o responsável pelo tratamento das informações necessárias ao funcionamento do jogo. Serviços de infraestrutura e publicidade podem tratar dados em nosso nome ou segundo as próprias políticas.',
      ],
    },
    {
      id: 'dados',
      title: '2. Informações que utilizamos',
      body: [
        'Recolhemos apenas as informações necessárias para operar a experiência multiplayer e manter a partida consistente entre os jogadores.',
      ],
      items: [
        'Nome ou apelido escolhido, avatar, iniciais e cor visual do jogador.',
        'Código e configurações da sala, ordem dos jogadores, presença online e horário da última ligação.',
        'Letras, categorias, respostas, votos, pontuações e resultados das rodadas.',
        'Identificadores técnicos e token privado de sessão; no servidor, o token é guardado como hash.',
        'Preferências guardadas no dispositivo, como idioma, tema, sons e último aviso de instalação.',
        'Métricas anónimas de utilização, como páginas visitadas, origem do tráfego, país aproximado, dispositivo, navegador e sistema operativo.',
        'Dados técnicos básicos que a infraestrutura de alojamento pode processar, como endereço IP, navegador e registos de pedidos.',
      ],
    },
    {
      id: 'finalidades',
      title: '3. Para que utilizamos os dados',
      body: [
        'Utilizamos estas informações para criar e sincronizar salas, autenticar ações, recuperar a tua sessão, calcular resultados, realizar votações, detetar ligações perdidas e proteger o jogo contra utilizações indevidas.',
        'As preferências no dispositivo tornam a experiência mais confortável. As métricas ajudam-nos a perceber que páginas funcionam melhor e onde melhorar. A publicidade ajuda a financiar o funcionamento do jogo e é apresentada de acordo com as escolhas de consentimento aplicáveis.',
      ],
    },
    {
      id: 'armazenamento',
      title: '4. Onde os dados ficam guardados',
      body: [
        'O estado das salas e partidas é guardado numa base de dados do servidor. A sessão de reconexão, o idioma e a preferência de som são guardados no armazenamento local do navegador.',
        'O service worker da PWA guarda apenas a interface pública e ficheiros estáticos para permitir que a aplicação abra sem ligação. APIs, salas e respostas não são guardadas nesse cache.',
      ],
    },
    {
      id: 'publicidade',
      title: '5. Analítica, publicidade, cookies e consentimento',
      body: [
        'O jogastop utiliza Vercel Web Analytics para medir visitas e páginas vistas. Segundo a Vercel, estes dados são anonimizados e não utilizam cookies.',
        'O jogastop utiliza o Google AdSense. A Google e os seus parceiros podem usar cookies, armazenamento local, identificadores do dispositivo e dados técnicos para apresentar, limitar e medir anúncios.',
        'No Espaço Económico Europeu, Reino Unido e Suíça, uma Plataforma de Gestão de Consentimento certificada pela Google apresenta as opções Consentir, Não consentir e Gerir opções. Podes rever ou retirar as tuas escolhas através das opções de privacidade disponibilizadas pela mensagem da Google.',
        'Quando recusas anúncios personalizados, ainda podem ser apresentados anúncios não personalizados ou limitados, conforme permitido pelas tuas escolhas e pela legislação aplicável.',
      ],
    },
    {
      id: 'partilha',
      title: '6. Visibilidade e partilha',
      body: [
        'O teu nome ou apelido, presença, pontuação e estado na partida são visíveis às pessoas da mesma sala. As respostas ficam privadas durante o relógio e tornam-se visíveis na fase de resultados e votação.',
        'Não vendemos dados pessoais. A infraestrutura de alojamento processa os dados necessários para servir a aplicação, e a Google processa dados de publicidade conforme o consentimento e as suas políticas.',
      ],
    },
    {
      id: 'conservacao',
      title: '7. Conservação e controlo',
      body: [
        'A sessão guardada no teu dispositivo permanece até limpares os dados do site no navegador. Nesta fase beta, as salas permanecem na infraestrutura até serem removidas durante manutenção, reinício ou nova publicação do serviço.',
        'Podes reduzir os dados associados a ti usando um apelido, saindo da sala e limpando os dados do site no navegador. Não submetas informações pessoais ou sensíveis como respostas.',
      ],
    },
    {
      id: 'menores',
      title: '8. Utilização por menores',
      body: [
        'O jogo não pede idade e não foi concebido para recolher intencionalmente dados sensíveis de crianças. Menores devem jogar com acompanhamento de um adulto e utilizar um apelido em vez do nome completo.',
      ],
    },
    {
      id: 'alteracoes',
      title: '9. Alterações desta política',
      body: [
        'Podemos actualizar esta política quando o jogo, os fornecedores ou os requisitos legais mudarem. A data no início da página indica a versão mais recente.',
      ],
    },
  ],
  googlePrivacy: 'Consultar a Política de Privacidade da Google',
  footer: 'Privacidade clara para jogar sem dúvidas.',
};

const en: PrivacyPolicyCopy = {
  badge: 'Privacy and consent',
  title: 'Play with peace of mind. Your data stays clear.',
  intro:
    'This policy explains what information jogastop uses to create rooms, keep games in sync, analyse visits and show advertising while respecting your choices.',
  updated: 'Last updated: June 17, 2026',
  backHome: 'Back to the game',
  overviewLabel: 'At a glance',
  overview: [
    {
      title: 'No account required',
      body: 'You can play using only a name or nickname visible in the room.',
    },
    {
      title: 'Data for the game',
      body: 'We store the state needed to sync, score and recover the game.',
    },
    {
      title: 'You decide about ads',
      body: "In applicable regions, Google's CMP presents your consent choices.",
    },
  ],
  contents: 'On this page',
  noteTitle: 'An important recommendation',
  noteBody:
    'Use a nickname and never enter personal information, passwords or sensitive data in game answers.',
  sections: [
    {
      id: 'scope',
      title: '1. Scope of this policy',
      body: [
        'This policy applies to the jogastop website and installable app. The game lets people create temporary rooms, invite others and play online rounds without creating an account.',
        'jogastop is responsible for processing the information needed to run the game. Infrastructure and advertising services may process data on our behalf or under their own policies.',
      ],
    },
    {
      id: 'data',
      title: '2. Information we use',
      body: [
        'We collect only the information needed to operate the multiplayer experience and keep the game consistent for all players.',
      ],
      items: [
        'Your chosen name or nickname, avatar, initials and player colour.',
        'Room code and settings, player order, online presence and last connection time.',
        'Letters, categories, answers, votes, scores and round results.',
        'Technical identifiers and a private session token; the server stores the token as a hash.',
        'Preferences stored on your device, such as language, theme, sounds and the latest installation prompt.',
        'Anonymous usage metrics, such as visited pages, traffic source, approximate country, device, browser and operating system.',
        'Basic technical data that the hosting infrastructure may process, such as IP address, browser and request logs.',
      ],
    },
    {
      id: 'purposes',
      title: '3. Why we use data',
      body: [
        'We use this information to create and sync rooms, authenticate actions, recover your session, calculate results, run votes, detect lost connections and protect the game from misuse.',
        'Device preferences make the experience more comfortable. Metrics help us understand which pages work best and where to improve. Advertising helps fund the game and is shown according to applicable consent choices.',
      ],
    },
    {
      id: 'storage',
      title: '4. Where data is stored',
      body: [
        "Room and game state is stored in a server database. Your reconnection session, language and sound preference are stored in your browser's local storage.",
        'The PWA service worker stores only the public interface and static files so the app can open offline. APIs, rooms and answers are never stored in that cache.',
      ],
    },
    {
      id: 'advertising',
      title: '5. Analytics, advertising, cookies and consent',
      body: [
        'jogastop uses Vercel Web Analytics to measure visits and page views. According to Vercel, this data is anonymized and does not use cookies.',
        'jogastop uses Google AdSense. Google and its partners may use cookies, local storage, device identifiers and technical data to show, limit and measure ads.',
        "In the European Economic Area, United Kingdom and Switzerland, a Google-certified Consent Management Platform presents Consent, Do not consent and Manage options. You can review or withdraw your choices through the privacy options made available by Google's message.",
        'When you refuse personalised ads, non-personalised or limited ads may still be shown, as allowed by your choices and applicable law.',
      ],
    },
    {
      id: 'sharing',
      title: '6. Visibility and sharing',
      body: [
        'Your name or nickname, presence, score and game status are visible to people in the same room. Answers remain private while the timer runs and become visible during results and voting.',
        'We do not sell personal data. Hosting infrastructure processes the data needed to serve the app, and Google processes advertising data according to consent and its policies.',
      ],
    },
    {
      id: 'retention',
      title: '7. Retention and control',
      body: [
        "The session stored on your device remains until you clear the site's browser data. During this beta phase, rooms remain in the infrastructure until they are removed during maintenance, a restart or a new service deployment.",
        'You can reduce the data linked to you by using a nickname, leaving the room and clearing site data in your browser. Do not submit personal or sensitive information as answers.',
      ],
    },
    {
      id: 'children',
      title: '8. Use by children',
      body: [
        'The game does not request age and is not designed to intentionally collect sensitive data from children. Minors should play with adult supervision and use a nickname instead of their full name.',
      ],
    },
    {
      id: 'changes',
      title: '9. Changes to this policy',
      body: [
        'We may update this policy when the game, providers or legal requirements change. The date at the top of the page identifies the latest version.',
      ],
    },
  ],
  googlePrivacy: "Read Google's Privacy Policy",
  footer: 'Clear privacy, so you can play without doubts.',
};

const fr: PrivacyPolicyCopy = {
  badge: 'Confidentialité et consentement',
  title: 'Joue sereinement. Tes données restent claires.',
  intro:
    'Cette politique explique quelles informations jogastop utilise pour créer des salles, synchroniser les parties, analyser les visites et afficher de la publicité dans le respect de tes choix.',
  updated: 'Dernière mise à jour : 17 juin 2026',
  backHome: 'Retour au jeu',
  overviewLabel: 'En bref',
  overview: [
    {
      title: 'Aucun compte obligatoire',
      body: 'Tu peux jouer avec seulement un nom ou un pseudonyme visible dans la salle.',
    },
    {
      title: 'Des données pour la partie',
      body: "Nous conservons l'état nécessaire pour synchroniser, noter et récupérer le jeu.",
    },
    {
      title: 'Tu choisis pour les annonces',
      body: 'Dans les régions concernées, la CMP de Google présente tes choix de consentement.',
    },
  ],
  contents: 'Sur cette page',
  noteTitle: 'Une recommandation importante',
  noteBody:
    "Utilise un pseudonyme et ne saisis jamais d'informations personnelles, de mots de passe ou de données sensibles dans les réponses.",
  sections: [
    {
      id: 'champ',
      title: "1. Champ d'application",
      body: [
        "Cette politique s'applique au site et à l'application installable jogastop. Le jeu permet de créer des salles temporaires, d'inviter d'autres personnes et de jouer en ligne sans créer de compte.",
        "jogastop est responsable du traitement des informations nécessaires au fonctionnement du jeu. Les services d'infrastructure et de publicité peuvent traiter des données pour notre compte ou selon leurs propres politiques.",
      ],
    },
    {
      id: 'donnees',
      title: '2. Informations utilisées',
      body: [
        'Nous collectons uniquement les informations nécessaires au mode multijoueur et à la cohérence de la partie pour tous les joueurs.',
      ],
      items: [
        'Nom ou pseudonyme choisi, avatar, initiales et couleur du joueur.',
        'Code et paramètres de la salle, ordre des joueurs, présence en ligne et heure de dernière connexion.',
        'Lettres, catégories, réponses, votes, scores et résultats des manches.',
        'Identifiants techniques et jeton de session privé ; le serveur conserve le jeton sous forme de hash.',
        "Préférences enregistrées sur l'appareil, comme la langue, le thème, les sons et la dernière invite d'installation.",
        "Mesures d'utilisation anonymes, comme les pages visitées, la source du trafic, le pays approximatif, l'appareil, le navigateur et le système d'exploitation.",
        "Données techniques de base que l'hébergeur peut traiter, comme l'adresse IP, le navigateur et les journaux de requêtes.",
      ],
    },
    {
      id: 'objectifs',
      title: '3. Pourquoi nous utilisons ces données',
      body: [
        'Nous utilisons ces informations pour créer et synchroniser les salles, authentifier les actions, récupérer ta session, calculer les résultats, organiser les votes, détecter les pertes de connexion et protéger le jeu contre les abus.',
        "Les préférences de l'appareil rendent l'expérience plus agréable. Les métriques nous aident à comprendre quelles pages fonctionnent le mieux et où améliorer le jeu. La publicité aide à financer le jeu et s'affiche selon les choix de consentement applicables.",
      ],
    },
    {
      id: 'stockage',
      title: '4. Où les données sont stockées',
      body: [
        "L'état des salles et des parties est stocké dans une base de données serveur. La session de reconnexion, la langue et la préférence sonore sont conservées dans le stockage local du navigateur.",
        "Le service worker de la PWA conserve uniquement l'interface publique et les fichiers statiques pour ouvrir l'application hors ligne. Les API, salles et réponses ne sont jamais conservées dans ce cache.",
      ],
    },
    {
      id: 'publicite',
      title: '5. Analyse, publicité, cookies et consentement',
      body: [
        "jogastop utilise Vercel Web Analytics pour mesurer les visites et les pages vues. Selon Vercel, ces données sont anonymisées et n'utilisent pas de cookies.",
        "jogastop utilise Google AdSense. Google et ses partenaires peuvent utiliser des cookies, le stockage local, des identifiants d'appareil et des données techniques pour afficher, limiter et mesurer les annonces.",
        "Dans l'Espace économique européen, au Royaume-Uni et en Suisse, une plateforme de gestion du consentement certifiée par Google présente les choix Consentir, Ne pas consentir et Gérer les options. Tu peux revoir ou retirer tes choix grâce aux options de confidentialité proposées par le message de Google.",
        'Si tu refuses les annonces personnalisées, des annonces non personnalisées ou limitées peuvent tout de même être affichées, selon tes choix et la loi applicable.',
      ],
    },
    {
      id: 'partage',
      title: '6. Visibilité et partage',
      body: [
        'Ton nom ou pseudonyme, ta présence, ton score et ton état de jeu sont visibles par les personnes de la même salle. Les réponses restent privées pendant le chrono puis deviennent visibles lors des résultats et des votes.',
        "Nous ne vendons pas de données personnelles. L'infrastructure d'hébergement traite les données nécessaires pour servir l'application, et Google traite les données publicitaires selon le consentement et ses politiques.",
      ],
    },
    {
      id: 'conservation',
      title: '7. Conservation et contrôle',
      body: [
        "La session enregistrée sur ton appareil reste présente jusqu'à ce que tu effaces les données du site dans le navigateur. Pendant cette phase bêta, les salles restent dans l'infrastructure jusqu'à leur suppression lors d'une maintenance, d'un redémarrage ou d'un nouveau déploiement.",
        "Tu peux réduire les données qui te sont liées en utilisant un pseudonyme, en quittant la salle et en effaçant les données du site dans ton navigateur. Ne soumets pas d'informations personnelles ou sensibles comme réponses.",
      ],
    },
    {
      id: 'mineurs',
      title: '8. Utilisation par les mineurs',
      body: [
        "Le jeu ne demande pas l'âge et n'est pas conçu pour collecter intentionnellement des données sensibles d'enfants. Les mineurs doivent jouer sous la supervision d'un adulte et utiliser un pseudonyme plutôt que leur nom complet.",
      ],
    },
    {
      id: 'modifications',
      title: '9. Modifications de cette politique',
      body: [
        'Nous pouvons mettre à jour cette politique lorsque le jeu, les fournisseurs ou les exigences légales changent. La date en haut de la page indique la version la plus récente.',
      ],
    },
  ],
  googlePrivacy: 'Consulter les Règles de confidentialité de Google',
  footer: 'Une confidentialité claire pour jouer sans hésiter.',
};

export const privacyPolicies: Record<Locale, PrivacyPolicyCopy> = { pt, en, fr };
