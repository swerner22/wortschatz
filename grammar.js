// Grammatik-Seiten für "Zeiten" und "Pronomen".
// Aufbau wie bei Paso a Paso: Überblick, dann eine Seite pro Thema mit Bildung, Verwendung, Signalwörtern und Beispielen.
(function () {
  "use strict";
  const attr = (s) => String(s).replace(/<[^>]+>/g, "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const SPK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>';

  const head = (eyebrow, title, lead) => `<header class="g-head"><p class="g-eyebrow">${eyebrow}</p><h1>${title}</h1>${lead ? `<p class="g-lead">${lead}</p>` : ""}</header>`;
  const card = (title, inner, cls) => `<section class="g-card ${cls || ""}">${title ? `<h2>${title}</h2>` : ""}${inner}</section>`;
  const table = (cols, rows, cls) => `<div class="g-tw"><table class="${cls || ""}"><thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const ex = (en, de) => `<div class="g-ex"><button class="g-say" data-a="say" data-t="${attr(en)}" aria-label="Vorlesen">${SPK}</button><div><p class="g-en" lang="en">${en}</p><p class="g-de">${de}</p></div></div>`;
  const exs = (list) => `<div class="g-exs">${list.map(([e, d]) => ex(e, d)).join("")}</div>`;
  const list = (items) => `<ul class="g-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  const signal = (words) => `<div class="g-signal">${words.map((w) => `<span lang="en">${w}</span>`).join("")}</div>`;
  const note = (html, cls) => `<div class="g-note ${cls || ""}">${html}</div>`;
  const tip = (html) => note(html, "tip");
  const go = (sec, id, label) => `<button class="g-link" data-a="gpage" data-sec="${sec}" data-id="${id}">${label}</button>`;
  const level = (b) => b ? '<span class="g-badge start">Starte hier</span>' : '<span class="g-badge later">Für später</span>';

  // Bildungstabelle: Personen x (Aussage, Verneinung, Frage)
  const P = ["I", "you", "he / she / it", "we", "you", "they"];
  const formTable = (aff, neg, q) => table(["Person", "Aussage", "Verneinung", "Frage"], P.map((p, i) => [`<span class="g-p">${p}</span>`, aff[i], neg[i], q[i]]), "forms");

  const ZEITEN = [
    { grp: "Überblick" },
    { id: "ueberblick", title: "Alle Zeiten", html: () => `
      ${head("Zeiten", "Die englischen Zeiten im Überblick", "Im Englischen gibt es mehr Zeiten als im Deutschen. Für jede Zeit gibt es eine einfache Form <b>(simple)</b> und eine Verlaufsform <b>(progressive)</b>, die zeigt: Das passiert gerade, es läuft noch.")}
      <section class="g-card"><h2>Der Zeitstrahl</h2>
        <div class="g-tlw"><div class="g-tl">
          <div class="zone past"><p class="zl">Vergangenheit</p>
            ${go("zeiten", "past-perfect", "<b>Past Perfect</b><span>noch früher als etwas Vergangenes</span>")}
            ${go("zeiten", "simple-past", "<b>Simple Past</b><span>abgeschlossen, mit Zeitangabe</span>")}
            ${go("zeiten", "past-progressive", "<b>Past Progressive</b><span>war gerade dabei</span>")}
            ${go("zeiten", "present-perfect", "<b>Present Perfect</b><span>Vergangenes mit Folgen für jetzt</span>")}
          </div>
          <div class="zone now"><p class="zl">Gegenwart</p>
            ${go("zeiten", "simple-present", "<b>Simple Present</b><span>immer, oft, regelmäßig</span>")}
            ${go("zeiten", "present-progressive", "<b>Present Progressive</b><span>genau jetzt</span>")}
          </div>
          <div class="zone fut"><p class="zl">Zukunft</p>
            ${go("zeiten", "going-to", "<b>going to-Future</b><span>Pläne und Absichten</span>")}
            ${go("zeiten", "will-future", "<b>will-Future</b><span>Vermutungen, spontane Ideen</span>")}
            ${go("zeiten", "future-progressive", "<b>Future Progressive</b><span>wird gerade dabei sein</span>")}
            ${go("zeiten", "future-perfect", "<b>Future Perfect</b><span>wird fertig sein</span>")}
          </div>
        </div></div>
      </section>
      ${table(["Zeit", "Bildung", "Beispiel mit <i>play</i>", ""], [
        [go("zeiten", "simple-present", "Simple Present"), "Grundform, bei he/she/it + s", "she play<mark>s</mark>", level(1)],
        [go("zeiten", "present-progressive", "Present Progressive"), "am / is / are + -ing", "she <mark>is</mark> play<mark>ing</mark>", level(1)],
        [go("zeiten", "simple-past", "Simple Past"), "Grundform + -ed oder 2. Form", "she play<mark>ed</mark>", level(1)],
        [go("zeiten", "past-progressive", "Past Progressive"), "was / were + -ing", "she <mark>was</mark> play<mark>ing</mark>", level(0)],
        [go("zeiten", "present-perfect", "Present Perfect"), "have / has + 3. Form", "she <mark>has</mark> play<mark>ed</mark>", level(0)],
        [go("zeiten", "present-perfect-progressive", "Present Perfect Progressive"), "have / has been + -ing", "she <mark>has been</mark> play<mark>ing</mark>", level(0)],
        [go("zeiten", "past-perfect", "Past Perfect"), "had + 3. Form", "she <mark>had</mark> play<mark>ed</mark>", level(0)],
        [go("zeiten", "past-perfect-progressive", "Past Perfect Progressive"), "had been + -ing", "she <mark>had been</mark> play<mark>ing</mark>", level(0)],
        [go("zeiten", "going-to", "going to-Future"), "am / is / are going to + Grundform", "she <mark>is going to</mark> play", level(1)],
        [go("zeiten", "will-future", "will-Future"), "will + Grundform", "she <mark>will</mark> play", level(1)],
        [go("zeiten", "future-progressive", "Future Progressive"), "will be + -ing", "she <mark>will be</mark> play<mark>ing</mark>", level(0)],
        [go("zeiten", "future-perfect", "Future Perfect"), "will have + 3. Form", "she <mark>will have</mark> play<mark>ed</mark>", level(0)]
      ])}
      ${card("Welche Zeit brauche ich?", list([
        "Passiert es <b>immer, oft oder regelmäßig</b>? → " + go("zeiten", "simple-present", "Simple Present"),
        "Passiert es <b>genau jetzt</b>? → " + go("zeiten", "present-progressive", "Present Progressive"),
        "Ist es <b>vorbei</b> und ich sage, <b>wann</b> (yesterday, last week)? → " + go("zeiten", "simple-past", "Simple Past"),
        "Ist es passiert und <b>wichtig für jetzt</b>, ohne genaue Zeit? → " + go("zeiten", "present-perfect", "Present Perfect"),
        "Ist es ein <b>Plan</b> für die Zukunft? → " + go("zeiten", "going-to", "going to-Future"),
        "Ist es eine <b>Vermutung</b> oder eine <b>spontane Idee</b>? → " + go("zeiten", "will-future", "will-Future")
      ]))}
      ${tip("<b>3. Form?</b> Das ist das Past Participle, also die dritte Spalte in der Liste der unregelmäßigen Verben: go – went – <b>gone</b>. " + go("verben", "liste", "Zu den Verben"))}` },

    { grp: "Gegenwart" },
    { id: "simple-present", title: "Simple Present", html: () => `
      ${head("Zeiten · Gegenwart", "Simple Present", "Die einfache Gegenwart. Du benutzt sie für Dinge, die <b>immer, oft oder regelmäßig</b> passieren, und für Tatsachen.")}
      ${card("So bildest du es", formTable(
        ["I play", "you play", "he play<mark>s</mark>", "we play", "you play", "they play"],
        ["I <mark>don't</mark> play", "you <mark>don't</mark> play", "he <mark>doesn't</mark> play", "we <mark>don't</mark> play", "you <mark>don't</mark> play", "they <mark>don't</mark> play"],
        ["<mark>Do</mark> I play?", "<mark>Do</mark> you play?", "<mark>Does</mark> he play?", "<mark>Do</mark> we play?", "<mark>Do</mark> you play?", "<mark>Do</mark> they play?"]
      ) + tip("<b>He, she, it – das s muss mit!</b> Aber nur in der Aussage. Bei <i>doesn't</i> und <i>does</i> steckt das s schon drin: he doesn't play<s>s</s>."))}
      ${card("Rechtschreibung beim -s", table(["Regel", "Beispiel"], [
        ["meistens einfach <b>-s</b>", "play → play<mark>s</mark>, read → read<mark>s</mark>"],
        ["nach s, sh, ch, x, o: <b>-es</b>", "watch → watch<mark>es</mark>, go → go<mark>es</mark>, do → do<mark>es</mark>"],
        ["Mitlaut + y wird <b>-ies</b>", "fly → fl<mark>ies</mark>, cry → cr<mark>ies</mark>"],
        ["Ausnahme", "have → <mark>has</mark>"]
      ]))}
      ${card("Wann benutzt du es?", list(["Gewohnheiten und Hobbys: <i>I play football every Saturday.</i>", "Tatsachen: <i>Cats like fish.</i>", "Fahrpläne und Stundenpläne: <i>The bus leaves at 7:30.</i>", "Mehrere Handlungen nacheinander: <i>She gets up, washes and has breakfast.</i>"]))}
      ${card("Signalwörter", signal(["always", "usually", "often", "sometimes", "never", "every day", "every week", "on Mondays", "at the weekend", "in the morning"]) + '<p class="g-small">Häufigkeitswörter wie <i>always</i> oder <i>never</i> stehen vor dem Verb: <i>I <b>never</b> eat fish.</i> Nur nach <i>am / is / are</i> stehen sie dahinter: <i>She is <b>always</b> late.</i></p>')}
      ${card("Beispiele", exs([
        ["I <mark>play</mark> football every Saturday.", "Ich spiele jeden Samstag Fußball."],
        ["My sister <mark>goes</mark> to school by bus.", "Meine Schwester fährt mit dem Bus zur Schule."],
        ["We <mark>don't have</mark> a dog.", "Wir haben keinen Hund."],
        ["<mark>Does</mark> he <mark>like</mark> pizza? – Yes, he does.", "Mag er Pizza? – Ja."],
        ["The sun <mark>rises</mark> in the east.", "Die Sonne geht im Osten auf."]
      ]))}
      ${card("Sonderfall: to be", table(["Person", "Aussage", "Verneinung", "Frage"], [
        ["I", "I <mark>am</mark> (I'm)", "I'm not", "<mark>Am</mark> I …?"],
        ["you / we / they", "you <mark>are</mark> (you're)", "you aren't", "<mark>Are</mark> you …?"],
        ["he / she / it", "he <mark>is</mark> (he's)", "he isn't", "<mark>Is</mark> he …?"]
      ]) + tip("Bei <i>be</i> gibt es kein <i>do</i>: <i>Are you happy?</i> – nicht <s>Do you be happy?</s>"))}
      ${card("Sonderfall: have got", exs([
        ["I <mark>have got</mark> a brother. / I<mark>'ve got</mark> a brother.", "Ich habe einen Bruder."],
        ["She <mark>has got</mark> blue eyes. / She<mark>'s got</mark> blue eyes.", "Sie hat blaue Augen."],
        ["<mark>Have</mark> you <mark>got</mark> a pet? – No, I <mark>haven't</mark>.", "Hast du ein Haustier? – Nein."]
      ]) + '<p class="g-small"><i>have got</i> bedeutet „besitzen, haben“. Die Frage bildest du ohne <i>do</i>.</p>')}` },

    { id: "present-progressive", title: "Present Progressive", html: () => `
      ${head("Zeiten · Gegenwart", "Present Progressive", "Die Verlaufsform der Gegenwart. Sie zeigt: Das passiert <b>genau jetzt</b>, in diesem Moment.")}
      ${card("So bildest du es", formTable(
        ["I <mark>am</mark> play<mark>ing</mark>", "you <mark>are</mark> play<mark>ing</mark>", "he <mark>is</mark> play<mark>ing</mark>", "we <mark>are</mark> play<mark>ing</mark>", "you <mark>are</mark> play<mark>ing</mark>", "they <mark>are</mark> play<mark>ing</mark>"],
        ["I<mark>'m not</mark> playing", "you <mark>aren't</mark> playing", "he <mark>isn't</mark> playing", "we <mark>aren't</mark> playing", "you <mark>aren't</mark> playing", "they <mark>aren't</mark> playing"],
        ["<mark>Am</mark> I playing?", "<mark>Are</mark> you playing?", "<mark>Is</mark> he playing?", "<mark>Are</mark> we playing?", "<mark>Are</mark> you playing?", "<mark>Are</mark> they playing?"]
      ) + '<p class="g-small">Formel: <b>am / is / are + Verb mit -ing</b></p>')}
      ${card("Rechtschreibung beim -ing", table(["Regel", "Beispiel"], [
        ["meistens einfach <b>-ing</b>", "read → read<mark>ing</mark>, play → play<mark>ing</mark>"],
        ["stummes -e fällt weg", "make → mak<mark>ing</mark>, dance → danc<mark>ing</mark>"],
        ["kurzer Vokal + ein Mitlaut: Mitlaut verdoppeln", "swim → swim<mark>ming</mark>, run → run<mark>ning</mark>, sit → sit<mark>ting</mark>"],
        ["-ie wird -y", "lie → l<mark>ying</mark>, die → d<mark>ying</mark>"]
      ]))}
      ${card("Wann benutzt du es?", list(["Etwas passiert gerade jetzt: <i>Look! The baby is sleeping.</i>", "Etwas ist nur vorübergehend: <i>I'm staying with my grandma this week.</i>", "Feste Verabredungen in der Zukunft: <i>I'm meeting Tom tomorrow.</i>"]))}
      ${card("Signalwörter", signal(["now", "right now", "at the moment", "Look!", "Listen!", "today", "this week"]))}
      ${card("Beispiele", exs([
        ["Look! The dog <mark>is swimming</mark> in the lake.", "Schau! Der Hund schwimmt im See."],
        ["I<mark>'m doing</mark> my homework at the moment.", "Ich mache gerade meine Hausaufgaben."],
        ["They <mark>aren't watching</mark> TV now.", "Sie sehen gerade nicht fern."],
        ["What <mark>are</mark> you <mark>doing</mark>?", "Was machst du gerade?"]
      ]))}
      ${card("Simple Present oder Present Progressive?", table(["Simple Present: regelmäßig", "Present Progressive: gerade jetzt"], [
        ["I <mark>play</mark> tennis every Monday.", "I<mark>'m playing</mark> tennis now."],
        ["She usually <mark>walks</mark> to school.", "Today she<mark>'s taking</mark> the bus."]
      ]) + tip("Manche Verben stehen fast nie in der -ing-Form, weil sie keine Handlung beschreiben: <i>like, love, hate, want, need, know, believe, understand</i>. Also: <i>I <b>want</b> an ice cream</i>, nicht <s>I'm wanting</s>."))}` },

    { grp: "Vergangenheit" },
    { id: "simple-past", title: "Simple Past", html: () => `
      ${head("Zeiten · Vergangenheit", "Simple Past", "Die einfache Vergangenheit. Du benutzt sie für Dinge, die <b>vorbei</b> sind, oft mit einer Zeitangabe wie <i>yesterday</i> oder <i>last week</i>. In Geschichten ist das die wichtigste Zeit.")}
      ${card("So bildest du es", formTable(
        ["I play<mark>ed</mark>", "you play<mark>ed</mark>", "he play<mark>ed</mark>", "we play<mark>ed</mark>", "you play<mark>ed</mark>", "they play<mark>ed</mark>"],
        ["I <mark>didn't</mark> play", "you <mark>didn't</mark> play", "he <mark>didn't</mark> play", "we <mark>didn't</mark> play", "you <mark>didn't</mark> play", "they <mark>didn't</mark> play"],
        ["<mark>Did</mark> I play?", "<mark>Did</mark> you play?", "<mark>Did</mark> he play?", "<mark>Did</mark> we play?", "<mark>Did</mark> you play?", "<mark>Did</mark> they play?"]
      ) + tip("Die Form ist für alle Personen gleich, auch für he / she / it. Nach <i>didn't</i> und <i>did</i> kommt die <b>Grundform</b>: <i>Did you <b>go</b>?</i>, nicht <s>Did you went?</s>"))}
      ${card("Regelmäßige Verben: -ed", table(["Regel", "Beispiel"], [
        ["meistens <b>-ed</b>", "play → play<mark>ed</mark>, watch → watch<mark>ed</mark>"],
        ["endet auf -e: nur <b>-d</b>", "like → like<mark>d</mark>, dance → dance<mark>d</mark>"],
        ["Mitlaut + y wird <b>-ied</b>", "try → tr<mark>ied</mark>, cry → cr<mark>ied</mark>"],
        ["kurzer Vokal + ein Mitlaut: verdoppeln", "stop → stop<mark>ped</mark>, plan → plan<mark>ned</mark>"]
      ]) + '<p class="g-small">Aussprache: <b>[t]</b> nach f, k, p, s, sh, ch (walked) · <b>[d]</b> meistens (played) · <b>[ɪd]</b> nach t und d (wanted, needed).</p>')}
      ${card("Unregelmäßige Verben", '<p>Viele wichtige Verben haben eine eigene Vergangenheitsform. Die musst du auswendig lernen.</p>' + exs([["go → <mark>went</mark>", "gehen → ging"], ["see → <mark>saw</mark>", "sehen → sah"], ["have → <mark>had</mark>", "haben → hatte"]]) + `<p>${go("verben", "liste", "Alle unregelmäßigen Verben ansehen")} ${go("verben", "trainer", "Verben üben")}</p>`)}
      ${card("Sonderfall: to be", table(["Person", "Aussage", "Verneinung", "Frage"], [
        ["I / he / she / it", "<mark>was</mark>", "wasn't", "<mark>Was</mark> I …?"],
        ["you / we / they", "<mark>were</mark>", "weren't", "<mark>Were</mark> you …?"]
      ]))}
      ${card("Signalwörter", signal(["yesterday", "last week", "last year", "two days ago", "in 2020", "when I was little", "then", "after that"]))}
      ${card("Beispiele", exs([
        ["Yesterday I <mark>visited</mark> my grandma.", "Gestern habe ich meine Oma besucht."],
        ["We <mark>went</mark> to the beach last summer.", "Letzten Sommer sind wir an den Strand gefahren."],
        ["She <mark>didn't see</mark> the film.", "Sie hat den Film nicht gesehen."],
        ["<mark>Did</mark> you <mark>have</mark> fun? – Yes, I did.", "Hattest du Spaß? – Ja."],
        ["It <mark>was</mark> cold and we <mark>were</mark> tired.", "Es war kalt und wir waren müde."]
      ]))}` },

    { id: "past-progressive", title: "Past Progressive", html: () => `
      ${head("Zeiten · Vergangenheit", "Past Progressive", "Die Verlaufsform der Vergangenheit. Sie zeigt: Jemand <b>war gerade dabei</b>, etwas zu tun.")}
      ${card("So bildest du es", formTable(
        ["I <mark>was</mark> play<mark>ing</mark>", "you <mark>were</mark> play<mark>ing</mark>", "he <mark>was</mark> play<mark>ing</mark>", "we <mark>were</mark> play<mark>ing</mark>", "you <mark>were</mark> play<mark>ing</mark>", "they <mark>were</mark> play<mark>ing</mark>"],
        ["I <mark>wasn't</mark> playing", "you <mark>weren't</mark> playing", "he <mark>wasn't</mark> playing", "we <mark>weren't</mark> playing", "you <mark>weren't</mark> playing", "they <mark>weren't</mark> playing"],
        ["<mark>Was</mark> I playing?", "<mark>Were</mark> you playing?", "<mark>Was</mark> he playing?", "<mark>Were</mark> we playing?", "<mark>Were</mark> you playing?", "<mark>Were</mark> they playing?"]
      ) + '<p class="g-small">Formel: <b>was / were + Verb mit -ing</b></p>')}
      ${card("Wann benutzt du es?", list(["Etwas war zu einem Zeitpunkt in der Vergangenheit gerade im Gange: <i>At 8 o'clock I was having breakfast.</i>", "Eine Handlung läuft, eine andere kommt dazwischen: <i>I was reading <b>when</b> the phone rang.</i>", "Zwei Dinge liefen gleichzeitig: <i>Mum was cooking <b>while</b> Dad was washing the car.</i>"]))}
      ${tip("Merke: Die <b>lange</b> Handlung steht im Past Progressive, die <b>kurze</b>, die dazwischenkommt, im Simple Past.")}
      ${card("Signalwörter", signal(["while", "when", "at 8 o'clock yesterday", "all day", "at that moment"]))}
      ${card("Beispiele", exs([
        ["I <mark>was watching</mark> TV when you called.", "Ich habe gerade ferngesehen, als du angerufen hast."],
        ["It <mark>was raining</mark> all day.", "Es hat den ganzen Tag geregnet."],
        ["What <mark>were</mark> you <mark>doing</mark> at 6 o'clock?", "Was hast du um 6 Uhr gemacht?"]
      ]))}` },

    { id: "present-perfect", title: "Present Perfect", html: () => `
      ${head("Zeiten · Vergangenheit mit Folgen", "Present Perfect", "Etwas ist passiert und hat etwas mit <b>jetzt</b> zu tun. <b>Wann</b> genau es war, ist egal oder wird nicht gesagt.")}
      ${card("So bildest du es", formTable(
        ["I <mark>have</mark> play<mark>ed</mark>", "you <mark>have</mark> play<mark>ed</mark>", "he <mark>has</mark> play<mark>ed</mark>", "we <mark>have</mark> play<mark>ed</mark>", "you <mark>have</mark> play<mark>ed</mark>", "they <mark>have</mark> play<mark>ed</mark>"],
        ["I <mark>haven't</mark> played", "you <mark>haven't</mark> played", "he <mark>hasn't</mark> played", "we <mark>haven't</mark> played", "you <mark>haven't</mark> played", "they <mark>haven't</mark> played"],
        ["<mark>Have</mark> I played?", "<mark>Have</mark> you played?", "<mark>Has</mark> he played?", "<mark>Have</mark> we played?", "<mark>Have</mark> you played?", "<mark>Have</mark> they played?"]
      ) + '<p class="g-small">Formel: <b>have / has + 3. Form</b> (Past Participle). Kurzformen: I<b>\'ve</b>, he<b>\'s</b>.</p>' + `<p>${go("verben", "liste", "3. Formen der unregelmäßigen Verben")}</p>`)}
      ${card("Wann benutzt du es?", list(["Das Ergebnis ist jetzt wichtig: <i>I've lost my key.</i> (Ich habe ihn jetzt nicht.)", "Erfahrungen, schon mal oder noch nie: <i>Have you ever been to London?</i>", "Es hat früher angefangen und dauert noch an: <i>We have lived here since 2020.</i>", "Gerade eben passiert: <i>I've just finished.</i>"]))}
      ${card("Signalwörter", signal(["ever", "never", "already", "just", "yet", "so far", "since", "for", "how long"]))}
      ${card("since oder for?", table(["since = seit einem Zeitpunkt", "for = seit einer Zeitdauer"], [
        ["since Monday", "for three days"], ["since 2020", "for two years"], ["since 8 o'clock", "for an hour"]
      ]))}
      ${card("Achtung: Simple Past oder Present Perfect?", table(["Simple Past: Zeitpunkt genannt", "Present Perfect: kein Zeitpunkt"], [
        ["I <mark>saw</mark> that film <b>yesterday</b>.", "I<mark>'ve seen</mark> that film."],
        ["She <mark>went</mark> to Spain <b>last year</b>.", "She<mark>'s been</mark> to Spain."]
      ]) + tip("Im Deutschen sagt man oft „Ich habe … gesehen“. Steht eine Zeitangabe wie <i>yesterday</i> dabei, nimmst du im Englischen trotzdem das <b>Simple Past</b>."))}
      ${card("Beispiele", exs([
        ["I<mark>'ve finished</mark> my homework. Can I go out?", "Ich habe meine Hausaufgaben fertig. Darf ich raus?"],
        ["<mark>Have</mark> you ever <mark>eaten</mark> sushi?", "Hast du schon mal Sushi gegessen?"],
        ["She <mark>hasn't called</mark> yet.", "Sie hat noch nicht angerufen."],
        ["We<mark>'ve known</mark> each other for five years.", "Wir kennen uns seit fünf Jahren."]
      ]))}` },

    { id: "present-perfect-progressive", title: "Present Perfect Progressive", html: () => `
      ${head("Zeiten · Vergangenheit bis jetzt", "Present Perfect Progressive", "Etwas hat früher angefangen und läuft <b>bis jetzt</b>. Hier geht es darum, <b>wie lange</b> schon.")}
      ${card("So bildest du es", formTable(
        ["I <mark>have been</mark> play<mark>ing</mark>", "you <mark>have been</mark> playing", "he <mark>has been</mark> playing", "we <mark>have been</mark> playing", "you <mark>have been</mark> playing", "they <mark>have been</mark> playing"],
        ["I <mark>haven't been</mark> playing", "you <mark>haven't been</mark> playing", "he <mark>hasn't been</mark> playing", "we <mark>haven't been</mark> playing", "you <mark>haven't been</mark> playing", "they <mark>haven't been</mark> playing"],
        ["<mark>Have</mark> I <mark>been</mark> playing?", "<mark>Have</mark> you <mark>been</mark> playing?", "<mark>Has</mark> he <mark>been</mark> playing?", "<mark>Have</mark> we <mark>been</mark> playing?", "<mark>Have</mark> you <mark>been</mark> playing?", "<mark>Have</mark> they <mark>been</mark> playing?"]
      ) + '<p class="g-small">Formel: <b>have / has been + Verb mit -ing</b></p>')}
      ${card("Wann benutzt du es?", list(["Die Dauer bis jetzt ist wichtig: <i>I've been waiting for an hour!</i>", "Man sieht noch die Folgen: <i>Your eyes are red. Have you been crying?</i>"]))}
      ${card("Signalwörter", signal(["for", "since", "all day", "how long", "lately"]))}
      ${card("Beispiele", exs([
        ["We<mark>'ve been playing</mark> football since two o'clock.", "Wir spielen seit zwei Uhr Fußball."],
        ["How long <mark>have</mark> you <mark>been learning</mark> English?", "Wie lange lernst du schon Englisch?"]
      ]))}` },

    { id: "past-perfect", title: "Past Perfect", html: () => `
      ${head("Zeiten · Vorvergangenheit", "Past Perfect", "Die Vorvergangenheit. Sie zeigt: Das ist <b>noch früher</b> passiert als etwas anderes in der Vergangenheit.")}
      ${card("So bildest du es", formTable(
        ["I <mark>had</mark> play<mark>ed</mark>", "you <mark>had</mark> played", "he <mark>had</mark> played", "we <mark>had</mark> played", "you <mark>had</mark> played", "they <mark>had</mark> played"],
        ["I <mark>hadn't</mark> played", "you <mark>hadn't</mark> played", "he <mark>hadn't</mark> played", "we <mark>hadn't</mark> played", "you <mark>hadn't</mark> played", "they <mark>hadn't</mark> played"],
        ["<mark>Had</mark> I played?", "<mark>Had</mark> you played?", "<mark>Had</mark> he played?", "<mark>Had</mark> we played?", "<mark>Had</mark> you played?", "<mark>Had</mark> they played?"]
      ) + '<p class="g-small">Formel: <b>had + 3. Form</b>, für alle Personen gleich. Kurzform: I<b>\'d</b>.</p>')}
      ${card("Wann benutzt du es?", list(["Zwei Dinge in der Vergangenheit, eins davon war früher: <i>When we arrived, the film <b>had</b> already <b>started</b>.</i>"]))}
      ${card("Signalwörter", signal(["before", "after", "already", "by the time", "when"]))}
      ${card("Beispiele", exs([
        ["After she <mark>had eaten</mark>, she went to bed.", "Nachdem sie gegessen hatte, ging sie ins Bett."],
        ["I couldn't get in because I <mark>had lost</mark> my key.", "Ich kam nicht rein, weil ich meinen Schlüssel verloren hatte."]
      ]))}` },

    { id: "past-perfect-progressive", title: "Past Perfect Progressive", html: () => `
      ${head("Zeiten · Vorvergangenheit", "Past Perfect Progressive", "Etwas lief schon eine Weile, <b>bevor</b> etwas anderes in der Vergangenheit passierte.")}
      ${card("So bildest du es", '<p>Formel: <b>had been + Verb mit -ing</b>, für alle Personen gleich.</p>' + exs([
        ["I <mark>had been playing</mark>.", "Ich hatte gespielt (eine Weile lang)."],
        ["She <mark>hadn't been sleeping</mark>.", "Sie hatte nicht geschlafen."],
        ["<mark>Had</mark> they <mark>been waiting</mark>?", "Hatten sie gewartet?"]
      ]))}
      ${card("Signalwörter", signal(["for", "since", "all day", "before", "when"]))}
      ${card("Beispiele", exs([
        ["We <mark>had been walking</mark> for hours when we found the café.", "Wir waren schon stundenlang gelaufen, als wir das Café fanden."],
        ["He was tired because he <mark>had been working</mark> all day.", "Er war müde, weil er den ganzen Tag gearbeitet hatte."]
      ]))}` },

    { grp: "Zukunft" },
    { id: "going-to", title: "going to-Future", html: () => `
      ${head("Zeiten · Zukunft", "going to-Future", "Damit sprichst du über <b>Pläne und Absichten</b>, also Dinge, die du dir schon vorgenommen hast.")}
      ${card("So bildest du es", formTable(
        ["I <mark>am going to</mark> play", "you <mark>are going to</mark> play", "he <mark>is going to</mark> play", "we <mark>are going to</mark> play", "you <mark>are going to</mark> play", "they <mark>are going to</mark> play"],
        ["I<mark>'m not going to</mark> play", "you <mark>aren't going to</mark> play", "he <mark>isn't going to</mark> play", "we <mark>aren't going to</mark> play", "you <mark>aren't going to</mark> play", "they <mark>aren't going to</mark> play"],
        ["<mark>Am</mark> I <mark>going to</mark> play?", "<mark>Are</mark> you <mark>going to</mark> play?", "<mark>Is</mark> he <mark>going to</mark> play?", "<mark>Are</mark> we <mark>going to</mark> play?", "<mark>Are</mark> you <mark>going to</mark> play?", "<mark>Are</mark> they <mark>going to</mark> play?"]
      ) + '<p class="g-small">Formel: <b>am / is / are + going to + Grundform</b></p>')}
      ${card("Wann benutzt du es?", list(["Pläne und Absichten: <i>I'm going to visit my aunt at the weekend.</i>", "Man sieht schon, dass es gleich passiert: <i>Look at the clouds! It's going to rain.</i>"]))}
      ${card("Signalwörter", signal(["tomorrow", "next week", "next year", "at the weekend", "soon", "Look!"]))}
      ${card("Beispiele", exs([
        ["We<mark>'re going to</mark> fly to Spain in the summer.", "Wir werden im Sommer nach Spanien fliegen."],
        ["She <mark>isn't going to</mark> come to the party.", "Sie wird nicht zur Party kommen."],
        ["What <mark>are</mark> you <mark>going to</mark> do tomorrow?", "Was hast du morgen vor?"],
        ["Be careful! You<mark>'re going to</mark> fall!", "Pass auf! Du fällst gleich!"]
      ]))}
      ${tip("Für feste Termine mit Uhrzeit nimmt man oft das " + go("zeiten", "present-progressive", "Present Progressive") + ": <i>I'm meeting Tom at 4.</i>")}` },

    { id: "will-future", title: "will-Future", html: () => `
      ${head("Zeiten · Zukunft", "will-Future", "Damit sprichst du über <b>Vermutungen</b>, über <b>spontane Entscheidungen</b> und über <b>Versprechen</b>.")}
      ${card("So bildest du es", formTable(
        ["I <mark>will</mark> play", "you <mark>will</mark> play", "he <mark>will</mark> play", "we <mark>will</mark> play", "you <mark>will</mark> play", "they <mark>will</mark> play"],
        ["I <mark>won't</mark> play", "you <mark>won't</mark> play", "he <mark>won't</mark> play", "we <mark>won't</mark> play", "you <mark>won't</mark> play", "they <mark>won't</mark> play"],
        ["<mark>Will</mark> I play?", "<mark>Will</mark> you play?", "<mark>Will</mark> he play?", "<mark>Will</mark> we play?", "<mark>Will</mark> you play?", "<mark>Will</mark> they play?"]
      ) + '<p class="g-small">Formel: <b>will + Grundform</b>, für alle Personen gleich. Kurzform: I<b>\'ll</b>. Verneinung: <b>won\'t</b> = will not.</p>')}
      ${note("<b>Achtung, falscher Freund!</b> Das englische <i>will</i> heißt <b>„werden“</b>, nicht „wollen“. „Ich will ein Eis“ heißt <i>I <b>want</b> an ice cream.</i>", "warn")}
      ${card("Wann benutzt du es?", list(["Vermutungen und Vorhersagen: <i>I think it will snow tomorrow.</i>", "Spontane Entscheidungen: <i>The phone is ringing. – I'll get it!</i>", "Versprechen und Angebote: <i>I'll help you with your homework.</i>", "Dinge, die sowieso passieren: <i>I'll be eleven next month.</i>"]))}
      ${card("Signalwörter", signal(["tomorrow", "next week", "soon", "I think", "I'm sure", "probably", "maybe", "perhaps"]))}
      ${card("Beispiele", exs([
        ["I think Lena <mark>will win</mark> the race.", "Ich glaube, Lena wird das Rennen gewinnen."],
        ["Don't worry, I <mark>won't tell</mark> anybody.", "Keine Sorge, ich werde es niemandem erzählen."],
        ["<mark>Will</mark> you <mark>help</mark> me, please?", "Hilfst du mir bitte?"],
        ["It's cold. I<mark>'ll close</mark> the window.", "Es ist kalt. Ich mache das Fenster zu."]
      ]))}
      ${card("will oder going to?", table(["going to: schon geplant", "will: Vermutung oder spontan"], [
        ["I<mark>'m going to</mark> buy a new bike. (Ich spare schon darauf.)", "Oh, this bike is cool. I<mark>'ll</mark> buy it! (Gerade entschieden.)"],
        ["Look at the sky! It<mark>'s going to</mark> rain.", "I think it<mark>'ll</mark> rain tomorrow."]
      ]))}` },

    { id: "future-progressive", title: "Future Progressive", html: () => `
      ${head("Zeiten · Zukunft", "Future Progressive", "Damit sagst du, dass jemand zu einem Zeitpunkt in der Zukunft <b>gerade dabei sein wird</b>, etwas zu tun.")}
      ${card("So bildest du es", '<p>Formel: <b>will be + Verb mit -ing</b>, für alle Personen gleich.</p>' + exs([
        ["This time tomorrow I <mark>will be sitting</mark> on the plane.", "Morgen um diese Zeit sitze ich im Flugzeug."],
        ["Don't call at 7. We<mark>'ll be having</mark> dinner.", "Ruf nicht um 7 an. Da essen wir gerade."],
        ["<mark>Will</mark> you <mark>be using</mark> the computer tonight?", "Brauchst du heute Abend den Computer?"]
      ]))}
      ${card("Signalwörter", signal(["this time tomorrow", "at 8 o'clock tomorrow", "all day tomorrow", "in an hour"]))}` },

    { id: "future-perfect", title: "Future Perfect", html: () => `
      ${head("Zeiten · Zukunft", "Future Perfect", "Damit sagst du, dass etwas bis zu einem Zeitpunkt in der Zukunft <b>schon fertig sein wird</b>.")}
      ${card("So bildest du es", '<p>Formel: <b>will have + 3. Form</b>, für alle Personen gleich.</p>' + exs([
        ["By 6 o'clock I <mark>will have finished</mark> my homework.", "Bis 6 Uhr werde ich meine Hausaufgaben fertig haben."],
        ["By next year she <mark>will have learnt</mark> to swim.", "Bis nächstes Jahr wird sie schwimmen gelernt haben."],
        ["<mark>Will</mark> you <mark>have read</mark> the book by Monday?", "Wirst du das Buch bis Montag gelesen haben?"]
      ]))}
      ${card("Signalwörter", signal(["by", "by then", "by the time", "by next week", "before"]))}
      ${tip("Es gibt auch noch das <b>Future Perfect Progressive</b> (will have been + -ing): <i>By June I will have been living here for two years.</i> Das brauchst du erst viel später.")}` }
  ];

  const PRONOMEN = [
    { grp: "Überblick" },
    { id: "ueberblick", title: "Alle Pronomen", html: () => `
      ${head("Pronomen", "Alle Pronomen auf einen Blick", "Pronomen sind Wörter, die für ein Nomen stehen. Statt „Lena“ sagst du <i>she</i>, statt „das Buch von mir“ sagst du <i>my book</i> oder <i>mine</i>.")}
      ${table(["Wer?", go("pronomen", "personal", "Personal&shy;pronomen"), go("pronomen", "objekt", "Objekt&shy;form"), go("pronomen", "possessiv", "Possessiv&shy;begleiter"), go("pronomen", "possessivpronomen", "Possessiv&shy;pronomen"), go("pronomen", "reflexiv", "Reflexiv&shy;pronomen")], [
        ["ich", "<b>I</b>", "me", "my", "mine", "myself"],
        ["du", "<b>you</b>", "you", "your", "yours", "yourself"],
        ["er", "<b>he</b>", "him", "his", "his", "himself"],
        ["sie", "<b>she</b>", "her", "her", "hers", "herself"],
        ["es", "<b>it</b>", "it", "its", "–", "itself"],
        ["wir", "<b>we</b>", "us", "our", "ours", "ourselves"],
        ["ihr", "<b>you</b>", "you", "your", "yours", "yourselves"],
        ["sie (Mehrzahl)", "<b>they</b>", "them", "their", "theirs", "themselves"]
      ], "pron")}
      ${card("Ein Satz, alle Formen", exs([
        ["<mark>I</mark> like this cat.", "Ich mag diese Katze. (Personalpronomen)"],
        ["The cat likes <mark>me</mark>.", "Die Katze mag mich. (Objektform)"],
        ["It's <mark>my</mark> cat.", "Es ist meine Katze. (Possessivbegleiter)"],
        ["The cat is <mark>mine</mark>.", "Die Katze gehört mir. (Possessivpronomen)"],
        ["I feed it <mark>myself</mark>.", "Ich füttere sie selbst. (Reflexivpronomen)"]
      ]))}
      ${card("Weitere Seiten", `<div class="g-links">${go("pronomen", "demonstrativ", "this, that, these, those")}${go("pronomen", "fragewoerter", "Fragewörter")}${go("pronomen", "some-any", "some, any und Co.")}</div>`)}` },

    { grp: "Personen" },
    { id: "personal", title: "Personalpronomen", html: () => `
      ${head("Pronomen", "Personalpronomen", "Sie stehen für Personen oder Dinge und sind meistens das <b>Subjekt</b> im Satz, also: Wer tut etwas?")}
      ${table(["", "Einzahl", "", "Mehrzahl", ""], [
        ["1. Person", "<b>I</b>", "ich", "<b>we</b>", "wir"],
        ["2. Person", "<b>you</b>", "du", "<b>you</b>", "ihr"],
        ["3. Person", "<b>he / she / it</b>", "er / sie / es", "<b>they</b>", "sie"]
      ])}
      <div class="g-grid">
        ${note("<b>I</b> schreibt man <b>immer groß</b>, auch mitten im Satz: <i>Tom and I are friends.</i>")}
        ${note("<b>you</b> heißt „du“, „ihr“ und auch „Sie“ (höflich). Es gibt nur ein Wort für alle drei.")}
        ${note("<b>it</b> benutzt du für Dinge und meistens für Tiere: <i>Where's my bag? – It's on the table.</i>")}
        ${note("<b>they</b> steht für mehrere Personen oder Dinge: <i>My parents? They're at work.</i>")}
      </div>
      ${card("Beispiele", exs([
        ["<mark>She</mark> is my best friend.", "Sie ist meine beste Freundin."],
        ["<mark>We</mark> live in a small town.", "Wir wohnen in einer kleinen Stadt."],
        ["Are <mark>you</mark> ready, kids?", "Seid ihr fertig, Kinder?"],
        ["I have a dog. <mark>It</mark> is very funny.", "Ich habe einen Hund. Er ist sehr lustig."]
      ]))}
      ${tip("Im Deutschen ist der Hund „er“. Im Englischen ist ein Tier meistens <b>it</b>. Nur beim eigenen Haustier sagen viele auch <i>he</i> oder <i>she</i>.")}` },

    { id: "objekt", title: "Objektform", html: () => `
      ${head("Pronomen", "Objektform der Personalpronomen", "Diese Form benutzt du, wenn die Person <b>nicht</b> das Subjekt ist: nach einem Verb oder nach Wörtern wie <i>with, for, to</i>.")}
      ${table(["Subjekt", "Objekt", "Deutsch"], [
        ["I", "<b>me</b>", "mich, mir"], ["you", "<b>you</b>", "dich, dir"], ["he", "<b>him</b>", "ihn, ihm"], ["she", "<b>her</b>", "sie, ihr"],
        ["it", "<b>it</b>", "es, ihm"], ["we", "<b>us</b>", "uns"], ["you", "<b>you</b>", "euch"], ["they", "<b>them</b>", "sie, ihnen"]
      ])}
      ${tip("Im Deutschen gibt es „mich“ <b>und</b> „mir“. Im Englischen gibt es nur <b>me</b>: <i>Help <b>me</b>!</i> und <i>Give it to <b>me</b>!</i>")}
      ${card("Beispiele", exs([
        ["Can you help <mark>me</mark>, please?", "Kannst du mir bitte helfen?"],
        ["I love <mark>him</mark>.", "Ich liebe ihn."],
        ["Come with <mark>us</mark>!", "Komm mit uns!"],
        ["Where are my shoes? I can't find <mark>them</mark>.", "Wo sind meine Schuhe? Ich finde sie nicht."],
        ["This present is for <mark>her</mark>.", "Dieses Geschenk ist für sie."]
      ]))}
      ${card("Subjekt oder Objekt?", table(["Subjekt: wer tut etwas", "Objekt: mit wem passiert etwas"], [
        ["<mark>He</mark> likes Anna.", "Anna likes <mark>him</mark>."], ["<mark>They</mark> call us.", "We call <mark>them</mark>."]
      ]))}` },

    { grp: "Besitz" },
    { id: "possessiv", title: "Possessivbegleiter", html: () => `
      ${head("Pronomen", "Possessivbegleiter", "Sie zeigen, <b>wem etwas gehört</b>. Sie stehen immer <b>vor</b> einem Nomen: <i>my bag, your pen</i>.")}
      ${table(["", "Englisch", "Deutsch", "Beispiel"], [
        ["I", "<b>my</b>", "mein, meine", "my bike"], ["you", "<b>your</b>", "dein, deine", "your room"], ["he", "<b>his</b>", "sein, seine", "his sister"],
        ["she", "<b>her</b>", "ihr, ihre", "her brother"], ["it", "<b>its</b>", "sein, ihr", "its tail"], ["we", "<b>our</b>", "unser, unsere", "our house"],
        ["you", "<b>your</b>", "euer, eure", "your teacher"], ["they", "<b>their</b>", "ihr, ihre", "their dog"]
      ])}
      <div class="g-grid">
        ${note("Im Englischen ändert sich das Wort <b>nie</b>: <i>my</i> passt für „mein“, „meine“ und „meinen“.")}
        ${note("<b>his</b> oder <b>her</b>? Das hängt davon ab, wem es gehört, nicht vom Ding: <i>Tom and <b>his</b> sister. Lena and <b>her</b> brother.</i>")}
      </div>
      ${note("<b>its</b> oder <b>it's</b>? <i>its</i> = sein/ihr (The dog wags <b>its</b> tail). <i>it's</i> = it is (<b>It's</b> cold).", "warn")}
      ${card("Beispiele", exs([
        ["This is <mark>my</mark> best friend Mia.", "Das ist meine beste Freundin Mia."],
        ["<mark>Their</mark> house is next to <mark>our</mark> school.", "Ihr Haus ist neben unserer Schule."],
        ["Is that <mark>your</mark> phone?", "Ist das dein Handy?"]
      ]))}
      ${card("Mit 's: wem gehört es?", exs([
        ["This is <mark>Tom's</mark> bike.", "Das ist Toms Fahrrad."],
        ["My <mark>parents'</mark> car is red.", "Das Auto meiner Eltern ist rot."]
      ]) + '<p class="g-small">Bei Namen und Personen hängst du <b>\'s</b> an. Endet das Wort in der Mehrzahl schon auf s, kommt nur der Apostroph: <i>parents\'</i>.</p>')}` },

    { id: "possessivpronomen", title: "Possessivpronomen", html: () => `
      ${head("Pronomen", "Possessivpronomen", "Auch sie zeigen, wem etwas gehört. Sie stehen aber <b>allein</b>, ohne Nomen dahinter: <i>This bag is <b>mine</b>.</i>")}
      ${table(["Begleiter (+ Nomen)", "Pronomen (allein)", "Deutsch"], [
        ["my book", "<b>mine</b>", "meins, meiner"], ["your book", "<b>yours</b>", "deins"], ["his book", "<b>his</b>", "seins"], ["her book", "<b>hers</b>", "ihrs"],
        ["our book", "<b>ours</b>", "unseres"], ["your book", "<b>yours</b>", "eures"], ["their book", "<b>theirs</b>", "ihres"]
      ])}
      ${note("<b>Nie mit Apostroph!</b> Es heißt <i>yours, hers, ours, theirs</i>, nicht <s>your's</s> oder <s>her's</s>.", "warn")}
      ${card("Beispiele", exs([
        ["Whose pencil is this? – It's <mark>mine</mark>.", "Wessen Bleistift ist das? – Das ist meiner."],
        ["Is this bag <mark>yours</mark>?", "Ist das deine Tasche?"],
        ["Their garden is bigger than <mark>ours</mark>.", "Ihr Garten ist größer als unserer."]
      ]))}` },

    { grp: "Weitere" },
    { id: "reflexiv", title: "Reflexivpronomen", html: () => `
      ${head("Pronomen", "Reflexivpronomen", "Sie zeigen, dass jemand etwas <b>mit sich selbst</b> macht oder etwas <b>selbst</b> tut.")}
      ${table(["", "Englisch", "Deutsch"], [
        ["I", "<b>myself</b>", "mich, mir, selbst"], ["you", "<b>yourself</b>", "dich, dir, selbst"], ["he", "<b>himself</b>", "sich, selbst"], ["she", "<b>herself</b>", "sich, selbst"],
        ["it", "<b>itself</b>", "sich, selbst"], ["we", "<b>ourselves</b>", "uns, selbst"], ["you", "<b>yourselves</b>", "euch, selbst"], ["they", "<b>themselves</b>", "sich, selbst"]
      ])}
      ${note("Einzahl endet auf <b>-self</b>, Mehrzahl auf <b>-selves</b>.")}
      ${card("Beispiele", exs([
        ["Be careful! Don't hurt <mark>yourself</mark>.", "Pass auf! Tu dir nicht weh."],
        ["I made this cake <mark>myself</mark>.", "Ich habe den Kuchen selbst gebacken."],
        ["Enjoy <mark>yourselves</mark>!", "Viel Spaß euch!"],
        ["The cat is washing <mark>itself</mark>.", "Die Katze putzt sich."]
      ]))}
      ${tip("Viele deutsche Verben mit „sich“ brauchen im Englischen <b>kein</b> Reflexivpronomen: sich freuen = <i>be happy</i>, sich treffen = <i>meet</i>, sich anziehen = <i>get dressed</i>, sich beeilen = <i>hurry</i>.")}
      ${card("each other = sich gegenseitig", exs([["Tom and Mia help <mark>each other</mark>.", "Tom und Mia helfen sich (gegenseitig)."]]))}` },

    { id: "demonstrativ", title: "this, that, these, those", html: () => `
      ${head("Pronomen", "this, that, these, those", "Damit zeigst du auf etwas. Es kommt darauf an, ob es <b>nah</b> oder <b>weit weg</b> ist und ob es <b>eins</b> oder <b>mehrere</b> sind.")}
      ${table(["", "nah (hier)", "weit weg (dort)"], [
        ["Einzahl", "<b>this</b> book – dieses Buch", "<b>that</b> book – das Buch da"],
        ["Mehrzahl", "<b>these</b> books – diese Bücher", "<b>those</b> books – die Bücher da"]
      ])}
      ${card("Beispiele", exs([
        ["<mark>This</mark> is my room.", "Das ist mein Zimmer."],
        ["Look at <mark>that</mark> bird!", "Schau dir den Vogel da an!"],
        ["<mark>These</mark> shoes are new.", "Diese Schuhe sind neu."],
        ["Who are <mark>those</mark> boys over there?", "Wer sind die Jungen da drüben?"]
      ]))}
      ${tip("Am Telefon stellst du dich mit <i>this</i> vor: <i>Hello, <b>this is</b> Lena.</i>")}` },

    { id: "fragewoerter", title: "Fragewörter", html: () => `
      ${head("Pronomen", "Fragewörter", "Mit diesen Wörtern beginnen Fragen. Viele fangen mit <b>wh-</b> an, deshalb heißen sie auch <i>wh-questions</i>.")}
      ${table(["Englisch", "Deutsch", "Beispiel"], [
        ["<b>who</b>", "wer, wen", "Who is your teacher?"], ["<b>what</b>", "was", "What's your name?"], ["<b>where</b>", "wo, wohin", "Where do you live?"],
        ["<b>when</b>", "wann", "When is your birthday?"], ["<b>why</b>", "warum", "Why are you sad?"], ["<b>which</b>", "welche, welcher, welches", "Which colour do you like?"],
        ["<b>whose</b>", "wessen", "Whose bag is this?"], ["<b>how</b>", "wie", "How are you?"], ["<b>how old</b>", "wie alt", "How old are you?"],
        ["<b>how many</b>", "wie viele (zählbar)", "How many brothers have you got?"], ["<b>how much</b>", "wie viel (nicht zählbar, Preis)", "How much is this?"], ["<b>what time</b>", "wie spät, um wie viel Uhr", "What time is it?"]
      ])}
      ${note("<b>Achtung, falsche Freunde:</b> <i>who</i> heißt „wer“, nicht „wo“. „Wo“ heißt <i>where</i>. Und <i>when</i> heißt „wann“, nicht „wenn“.", "warn")}
      ${card("Zum Anhören", exs([["Where <mark>do</mark> you live?", "Wo wohnst du?"], ["What <mark>does</mark> your dad do?", "Was macht dein Papa beruflich?"], ["Why <mark>did</mark> you laugh?", "Warum hast du gelacht?"]]) + '<p class="g-small">Nach dem Fragewort kommt im Simple Present und Simple Past meist <i>do / does / did</i>.</p>')}` },

    { id: "some-any", title: "some, any und Co.", html: () => `
      ${head("Pronomen", "some, any und Co.", "<i>some</i> und <i>any</i> bedeuten „etwas, einige“. Zusammen mit <i>-body, -thing, -where</i> entstehen viele nützliche Wörter.")}
      ${table(["", "+ body (Person)", "+ thing (Sache)", "+ where (Ort)"], [
        ["<b>some</b> (Aussage)", "somebody – jemand", "something – etwas", "somewhere – irgendwo"],
        ["<b>any</b> (Frage, Verneinung)", "anybody – (irgend)jemand", "anything – (irgend)etwas", "anywhere – irgendwo"],
        ["<b>no</b>", "nobody – niemand", "nothing – nichts", "nowhere – nirgendwo"],
        ["<b>every</b>", "everybody – jeder, alle", "everything – alles", "everywhere – überall"]
      ])}
      ${card("Die Faustregel", list(["<b>some</b> in Aussagesätzen: <i>I have <b>some</b> apples.</i>", "<b>any</b> in Fragen und verneinten Sätzen: <i>Have you got <b>any</b> apples? – No, I haven't got <b>any</b>.</i>", "Bei Angeboten und Bitten nimmt man in Fragen <b>some</b>: <i>Would you like <b>some</b> tea?</i>"]))}
      ${card("Beispiele", exs([
        ["<mark>Somebody</mark> is at the door.", "Jemand ist an der Tür."],
        ["I can't see <mark>anything</mark>.", "Ich kann nichts sehen."],
        ["<mark>Everybody</mark> likes ice cream.", "Alle mögen Eis."],
        ["There's <mark>nothing</mark> in the fridge.", "Im Kühlschrank ist nichts."]
      ]))}
      ${tip("<i>somebody</i> und <i>someone</i> bedeuten dasselbe. Genauso <i>anybody</i> und <i>anyone</i> usw.")}` }
  ];

  window.GRAMMAR = { zeiten: ZEITEN, pronomen: PRONOMEN };
})();
