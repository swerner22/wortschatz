# Mein WortSchatz – Anleitung

Vokabeltrainer Englisch für die 5. Klasse, passend zu **Lighthouse 1 (General Edition, Cornelsen)**.
Die App läuft im Browser, braucht kein Konto und speichert alles nur auf dem Tablet.

## 1. Adresse

Die App liegt auf GitHub Pages unter **https://swerner22.github.io/wortschatz/**.
Der Code liegt im Repository `swerner22/wortschatz`. Die Vokabeln deiner Tochter sind nicht darin, sie bleiben auf dem Tablet.

## 2. Auf dem Android-Tablet installieren

1. Die Adresse in **Chrome** öffnen.
2. Im Menü (⋮) auf **Zum Startbildschirm hinzufügen** bzw. **App installieren** tippen. In der App erscheint unter „Ich“ auch ein Knopf dafür.
3. Jetzt gibt es ein eigenes App-Symbol. Die App funktioniert danach auch ohne Internet.

## 3. So funktioniert die App

- **Wörter eintragen:** Knopf „Neues Wort“. Englisch, Deutsch, Unit und optional einen Beispielsatz eingeben. Mehrere deutsche Bedeutungen mit Komma trennen. „Speichern und weiter“ hält die Unit fest, so geht eine ganze Vokabelseite schnell.
- **Units:** Welcome und Unit 1 bis 5 sind angelegt. Weitere Units lassen sich unter „Wörter“ hinzufügen. Mit dem Stift-Symbol kann man sie umbenennen, z. B. mit dem Unit-Titel aus dem Buch.
- **Extra-Wortschatz:** acht Themenlisten mit allgemeinem Grundwortschatz (Schule, Familie, Tiere …). Sie sind zunächst ausgeschaltet und lassen sich unter „Wörter“ einzeln einschalten.
- **Karteikasten:** Jede Karte wandert bei richtiger Antwort ein Fach weiter (Abfrage nach 1, 2, 4, 7 und 14 Tagen) und bei falscher Antwort zurück in Fach 1. Auf der Startseite steht, wie viele Wörter heute fällig sind.
- **Üben:** Karteikarte (selbst einschätzen), Auswählen (4 Möglichkeiten) oder Schreiben (mit Rechtschreibprüfung). Bei „Fast!“ war nur ein Buchstabe falsch. Falsch beantwortete Wörter kommen am Ende der Runde noch einmal dran.
- **Vorlesen:** Das Lautsprecher-Symbol nutzt die englische Stimme des Tablets. Falls keine englische Stimme klingt: Android-Einstellungen → Sprache → Text-in-Sprache → Google-Sprachausgabe → Englisch (UK) installieren.
- **Belohnung:** 1 Münze pro richtiger Antwort, 5 Bonusmünzen pro Runde, dazu eine Tages-Serie 🔥.

## 4. Sicherung (wichtig)

Die Wörter liegen nur im Browser-Speicher des Tablets. Werden die Chrome-Daten gelöscht oder wird das Tablet zurückgesetzt, sind sie weg.
Unter **Ich → Sicherung schicken** entsteht eine Datei, die man z. B. per WhatsApp oder E-Mail an Papa schicken kann. Mit **Sicherung laden** wird sie wiederhergestellt.

## 5. App später ändern

Dateien im Repository ersetzen und in `sw.js` die Zeile `const VERSION = "wortschatz-v1";` hochzählen (v2, v3 …). Beim nächsten Öffnen mit Internet lädt das Tablet die neue Fassung. Die eingetragenen Wörter bleiben erhalten.
