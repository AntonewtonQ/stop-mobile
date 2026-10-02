# Validacao mobile

## Validacao local

```bash
npm run typecheck
npm run lint
npm test
npx expo install --check
npm run export:check
```

Os testes automatizados cobrem o contrato da API, cancelamento e timeout de pedidos,
respostas fora de ordem, pausa/retoma, falhas de autosave e separacao de rascunhos
entre rodadas. A exportacao compila JavaScript e assets para Android, iOS e web;
nao substitui uma compilacao nativa assinada nem testes em dispositivos.

## Partida entre mobile e web

Usar uma API de testes ou criar uma sala de teste explicitamente. Nao ha alteracoes
no backend web nesta entrega.

1. Criar uma sala no mobile e entrar pelo web. Repetir com o anfitriao no web.
2. Entrar pelo codigo e por `jogastop://sala/CODIGO`, sem sessao anterior.
3. Escolher categorias, tempo e pelo menos duas rodadas. Esperar a confirmacao de gravacao.
4. Confirmar que so o comandante escolhe a letra e que uma letra usada fica indisponivel.
5. Preencher categorias com o teclado aberto. Verificar o STOP e o avanco entre campos.
6. Aguardar varios ciclos de sincronizacao: o texto nao deve desaparecer.
7. Gritar STOP no mobile e no web, em partidas separadas. Conferir a transicao no outro cliente.
8. Verificar resumo, votos pendentes, votos registados e mudanca de pontuacao.
9. Avancar para a segunda rodada: os campos devem comecar vazios.
10. Ver a classificacao final e iniciar revanche com os mesmos jogadores.

## Interrupcoes

1. Desligar a rede durante a escrita. Confirmar aviso de ligacao e que o rascunho permanece.
2. Recuperar a rede. Confirmar nova sincronizacao e gravacao das respostas pendentes.
3. Abrir WhatsApp e voltar antes do prazo de presenca. Confirmar recuperacao da sala.
4. Ficar em segundo plano mais de 35 segundos. Confirmar offline/transferencia no web e recuperacao ao voltar.
5. Fechar e reabrir o app. Retomar a sala e verificar as respostas ja guardadas no servidor.
6. Repetir com Android e iPhone, ecra pequeno, fonte ampliada e PT/EN/FR.

## Sessao segura

- Instalar um build anterior, entrar numa sala e actualizar para o novo build
  assinado sem desinstalar; confirmar a reconexao com o mesmo jogador.
- Repetir com varias sessoes antigas guardadas e confirmar que todas as validas
  migram ao primeiro acesso, mantendo idioma, tema, som e ultima sala.
- Confirmar que novas sessoes nao guardam tokens no AsyncStorage Android/iOS.
  Nao copiar tokens reais para logs, screenshots ou pedidos de suporte.
- Simular falha de gravacao/leitura segura e repetir: nao deve haver fallback
  para texto simples nem eliminacao da unica copia da sessao antiga.
- Fechar/reabrir a app e bloquear/desbloquear o dispositivo; confirmar a retoma
  sem pedidos de biometria repetidos durante o polling.
- Validar backup/restauro e reinstalacao em Android/iOS separadamente: a sessao
  pode deixar de estar disponivel, e o Keychain iOS pode persistir ao desinstalar.
- Testar o Expo web: mantem armazenamento do navegador, sem chamadas ao SecureStore.

Os testes automatizados cobrem migracao parcial, falhas, concorrencia e recuperacao
com adaptadores simulados. Nao provam a proteccao nativa num dispositivo real.
Gerar um novo build: foi adicionado `expo-crypto` e explicitada a configuracao do
SecureStore (backup Android e ausencia de permissao Face ID).

## Privacidade alinhada com o web

Politica publica para as lojas: https://jogastop.ao/privacidade

Os responsaveis sao Antonewton Quima e Adilson Fernandes; o contacto e
`antonewtonquima@gmail.com`. A politica em `src/features/privacy/privacy.ts` abrange
Android/iOS e distingue o site/PWA, com o mesmo conteudo PT/EN/FR de
`lib/i18n/privacy.ts` no repositorio web. Actualizar as duas copias em conjunto.

- Testar o link de contacto em ambos os clientes e confirmar o acompanhamento do e-mail.
- Abrir a politica sem conta, em PT/EN/FR, e confirmar o link para a versao publica.
- Sem rede, o texto integrado continua disponivel; falhas ao abrir links mostram um aviso.
- Declarar os dados enviados a API: nome/apelido, identificadores, dados de jogo,
  presenca e dados tecnicos de pedidos. Sem analytics nativo nao significa sem recolha.
- Distinguir a sessao nativa no SecureStore das preferencias/codigo da ultima sala
  no AsyncStorage. O web usa armazenamento do navegador. Apagar a app nao apaga
  os dados da API; no iOS, o Keychain pode persistir apos desinstalacao.
- Nao declarar AdSense, AdMob ou Vercel Web Analytics como SDKs da app nativa actual.
  Estao descritos na politica apenas como servicos web; verificar o binario final.
- Confirmar no build assinado que nao se pedem camera, microfone, contactos ou
  localizacao precisa para as funcionalidades actuais.
- Confirmar a visibilidade do apelido no ranking publico e dos dados da sala
  para quem tem o codigo/link. Evitar nomes reais nos dados de teste.
- Conferir a retencao e os fornecedores em producao antes de preencher as fichas
  de privacidade das lojas. O texto descreve os limites de limpeza por defeito,
  nao uma verificacao da sua execucao em producao.

Estas verificacoes nao substituem os formularios Data Safety/App Privacy nem
garantem aprovacao das lojas. O texto publicado deve reflectir o build submetido.

## Antes de disponibilizar nas lojas

- Confirmar as contas Google Play e Apple Developer, identificadores e assinatura.
- Confirmar que o build usa `https://jogastop.ao`, nunca o IP local de desenvolvimento.
- Testar os ficheiros assinados e a splash; Expo Go nao valida a configuracao nativa final.
- <Preencher privacidade, classificacao etaria, contacto de suporte e capturas reais>.
- Seleccionar testers e canais de teste; guardar o ID de cada build validado.
- Verificar requisitos actuais das lojas e a imagem de compilacao EAS antes da submissao.

Referencias: [EAS versions](https://docs.expo.dev/build-reference/app-versions/),
[Android submission](https://docs.expo.dev/submit/android/),
[TestFlight / iOS](https://docs.expo.dev/submit/ios/).
