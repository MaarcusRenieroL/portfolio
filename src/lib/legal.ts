import { SITE } from "./content";
import type { Lang } from "./i18n";

/**
 * Privacy policy and legal notice. Every statement here must match what the code does;
 * when a data flow changes (a new service, a new table, a new retention rule), change this too.
 * Retention numbers mirror `RETENTION` in src/lib/server/retention.ts.
 */

export type Section = { id: string; h: string; p: string[]; list?: string[] };
export type LegalDoc = { title: string; lead: string; updated: string; sections: Section[] };

const UPDATED = "2026-11-19";
const MAIL = SITE.email;

const privacy: Record<Lang, LegalDoc> = {
  en: {
    title: "Privacy",
    lead: "What this site collects, why, who else touches it, and how to get it deleted. Short version: no ads, no tracking cookies, nothing sold, and as little as possible kept.",
    updated: UPDATED,
    sections: [
      {
        id: "who",
        h: "Who is responsible",
        p: [`${SITE.name}, Chennai, India. Email: ${MAIL}. This is a personal portfolio; there is no company behind it.`],
      },
      {
        id: "visiting",
        h: "When you visit a page",
        p: [
          "The site is hosted by Vercel. Like any web host, Vercel processes your IP address and browser details to deliver pages and keep the service secure.",
          "I count page views and a few clicks (a résumé download, a link to GitHub) with my own analytics. For each event I store the page path, the label of what was clicked, and a visitor id that is a one-way hash of your IP address and browser, salted with a secret that changes every day. The hash can't be turned back into your IP address, and the same visitor gets a new id tomorrow. No cookie is set. I keep these events for 13 months.",
          "Vercel Web Analytics also counts page views in aggregate, without cookies.",
          "If your browser sends Do Not Track or Global Privacy Control, none of this counting happens.",
          "Attempts to sign in to the private admin area are logged with a hashed IP address to stop brute-force attacks, and kept for 13 months.",
        ],
      },
      {
        id: "browser",
        h: "What is stored in your browser",
        p: ["Only settings you choose, never anything that identifies you:"],
        list: [
          "Your theme (light or dark) and whether sounds are on, in local storage.",
          "Your language, in a cookie named lang that lasts a year.",
          "A flag so the intro animation plays once per tab, in session storage.",
        ],
      },
      {
        id: "contact",
        h: "When you send a message",
        p: [
          "The contact form sends your name, email address, organisation if given, reason and message to my inbox through Resend, an email service, and keeps a copy in this site's database so no message is lost. The copy is deleted after 12 months; the email stays as long as the conversation needs it.",
          "When the spam check is on, Cloudflare Turnstile checks that you're a person. Cloudflare sees your IP address and browser signals for that check.",
        ],
      },
      {
        id: "booking",
        h: "When you book a call",
        p: [
          "Booking stores your name, email address, optional notes, your time zone and the time you picked in this site's database (Postgres, hosted by Neon), and emails me the details with a calendar invite through Resend. You may get a confirmation email too.",
          "Bookings are deleted 12 months after the call.",
        ],
      },
      {
        id: "embeds",
        h: "Live widgets",
        p: [
          "The home page shows my Discord status. My server fetches it from Lanyard; your browser never contacts Lanyard or Discord.",
          "The contribution graph is fetched by my server from GitHub. No visitor data goes to GitHub.",
          "Fonts are served from this site, not from Google.",
          "Images, certificates and the résumé PDF load from assets.maarcus.dev, served by Cloudflare. Like any host, Cloudflare processes your IP address and browser details to deliver them.",
          "The footer shows a DMCA.com protection badge. The image loads from dmca.com, which receives your IP address and browser details like any image host. It is loaded without telling dmca.com which page you are on, and without any script or cookie.",
        ],
      },
      {
        id: "basis",
        h: "Legal basis",
        p: [
          "If the GDPR applies to you: analytics and security run on my legitimate interest in a working, secure site (Art. 6(1)(f)); handling your message or booking is needed to answer the request you made (Art. 6(1)(b)). Settings stored in your browser are strictly necessary for the feature you used.",
        ],
      },
      {
        id: "processors",
        h: "Services involved",
        p: ["Each only gets what its job needs:"],
        list: [
          "Vercel Inc. (USA): hosting, web analytics.",
          "Neon Inc. (USA): the database for messages, bookings and site content.",
          "Resend (USA): delivering emails.",
          "Cloudflare Inc. (USA): file storage and delivery (assets.maarcus.dev), the spam check when it's on.",
          "DMCA.com (USA): the protection badge image in the footer.",
        ],
      },
      {
        id: "transfers",
        h: "International transfers",
        p: ["I live in India and these services are based in the USA, so your data leaves the EU when you contact me. Each provider uses standard contractual clauses or an equivalent safeguard for transfers out of the EU."],
      },
      {
        id: "rights",
        h: "Your rights",
        p: [
          `You can ask what I hold about you, have it corrected or deleted, object to its use, or get a copy. Email ${MAIL} and I'll answer within 30 days. Analytics ids are anonymous and change daily, so I can't link them to you even on request.`,
          "If you're in the EU, you can also complain to your local data protection authority.",
        ],
      },
      {
        id: "changes",
        h: "Changes",
        p: ["When this page changes, the date at the top changes too. Bigger changes are also listed in the changelog."],
      },
    ],
  },
  de: {
    title: "Datenschutz",
    lead: "Was diese Seite erfasst, warum, wer sonst damit zu tun hat und wie Sie es löschen lassen. Kurz: keine Werbung, keine Tracking-Cookies, nichts wird verkauft, und so wenig wie möglich wird gespeichert.",
    updated: UPDATED,
    sections: [
      {
        id: "who",
        h: "Verantwortlicher",
        p: [`${SITE.name}, Chennai, Indien. E-Mail: ${MAIL}. Dies ist ein persönliches Portfolio; es steht kein Unternehmen dahinter.`],
      },
      {
        id: "visiting",
        h: "Wenn Sie eine Seite aufrufen",
        p: [
          "Die Seite wird von Vercel gehostet. Wie jeder Hoster verarbeitet Vercel Ihre IP-Adresse und Browserdaten, um Seiten auszuliefern und den Dienst abzusichern.",
          "Seitenaufrufe und einige Klicks (ein Lebenslauf-Download, ein Link zu GitHub) zähle ich mit einer eigenen Statistik. Pro Ereignis speichere ich den Seitenpfad, die Bezeichnung des Klicks und eine Besucherkennung: ein Einweg-Hash aus IP-Adresse und Browser, gesalzen mit einem Geheimnis, das täglich wechselt. Daraus lässt sich die IP-Adresse nicht zurückgewinnen, und am nächsten Tag erhalten Sie eine neue Kennung. Es wird kein Cookie gesetzt. Diese Ereignisse bewahre ich 13 Monate auf.",
          "Vercel Web Analytics zählt Seitenaufrufe zusätzlich in aggregierter Form, ohne Cookies.",
          "Sendet Ihr Browser „Do Not Track“ oder „Global Privacy Control“, findet keine Zählung statt.",
          "Anmeldeversuche im privaten Admin-Bereich werden mit einer gehashten IP-Adresse protokolliert, um Angriffe abzuwehren, und 13 Monate aufbewahrt.",
        ],
      },
      {
        id: "browser",
        h: "Was in Ihrem Browser gespeichert wird",
        p: ["Nur Einstellungen, die Sie selbst wählen, nie etwas, das Sie identifiziert:"],
        list: [
          "Ihr Farbschema (hell oder dunkel) und ob Töne an sind, im Local Storage.",
          "Ihre Sprache, in einem Cookie namens lang mit einem Jahr Laufzeit.",
          "Ein Merker, damit die Intro-Animation nur einmal pro Tab läuft, im Session Storage.",
        ],
      },
      {
        id: "contact",
        h: "Wenn Sie mir schreiben",
        p: [
          "Das Kontaktformular schickt Ihren Namen, Ihre E-Mail-Adresse, ggf. Ihre Organisation, den Anlass und Ihre Nachricht über den E-Mail-Dienst Resend an mein Postfach und legt eine Kopie in der Datenbank dieser Seite ab, damit keine Nachricht verloren geht. Die Kopie wird nach 12 Monaten gelöscht; die E-Mail behalte ich, solange das Gespräch es erfordert.",
          "Ist die Spam-Prüfung aktiv, prüft Cloudflare Turnstile, ob Sie ein Mensch sind. Cloudflare sieht dafür Ihre IP-Adresse und Browsermerkmale.",
        ],
      },
      {
        id: "booking",
        h: "Wenn Sie einen Termin buchen",
        p: [
          "Eine Buchung speichert Ihren Namen, Ihre E-Mail-Adresse, optionale Notizen, Ihre Zeitzone und den gewählten Termin in der Datenbank dieser Seite (Postgres, gehostet von Neon) und schickt mir die Angaben samt Kalendereinladung über Resend. Sie erhalten eventuell eine Bestätigung per E-Mail.",
          "Buchungen werden 12 Monate nach dem Termin gelöscht.",
        ],
      },
      {
        id: "embeds",
        h: "Live-Elemente",
        p: [
          "Die Startseite zeigt meinen Discord-Status. Mein Server ruft ihn bei Lanyard ab; Ihr Browser kontaktiert weder Lanyard noch Discord.",
          "Die Beitragsgrafik ruft mein Server bei GitHub ab. Es gehen keine Besucherdaten an GitHub.",
          "Schriften werden von dieser Seite geladen, nicht von Google.",
          "Bilder, Zertifikate und das Lebenslauf-PDF werden von assets.maarcus.dev geladen und von Cloudflare ausgeliefert. Wie jeder Hoster verarbeitet Cloudflare dabei Ihre IP-Adresse und Browserdaten.",
          "Die Fußzeile zeigt ein DMCA.com-Schutzsiegel. Das Bild wird von dmca.com geladen, das dabei wie jeder Bildhoster Ihre IP-Adresse und Browserdaten erhält. Es wird ohne Angabe der besuchten Seite und ohne Skript oder Cookie geladen.",
        ],
      },
      {
        id: "basis",
        h: "Rechtsgrundlage",
        p: [
          "Statistik und Sicherheit beruhen auf meinem berechtigten Interesse an einer funktionierenden, sicheren Seite (Art. 6 Abs. 1 lit. f DSGVO); die Bearbeitung Ihrer Nachricht oder Buchung ist zur Beantwortung Ihrer Anfrage erforderlich (Art. 6 Abs. 1 lit. b DSGVO). Im Browser gespeicherte Einstellungen sind für die genutzte Funktion unbedingt erforderlich (§ 25 Abs. 2 TDDDG).",
        ],
      },
      {
        id: "processors",
        h: "Beteiligte Dienste",
        p: ["Jeder erhält nur, was er für seine Aufgabe braucht:"],
        list: [
          "Vercel Inc. (USA): Hosting, Web Analytics.",
          "Neon Inc. (USA): Datenbank für Nachrichten, Buchungen und Inhalte.",
          "Resend (USA): Versand von E-Mails.",
          "Cloudflare Inc. (USA): Dateispeicher und -auslieferung (assets.maarcus.dev), Spam-Prüfung, wenn aktiv.",
          "DMCA.com (USA): das Schutzsiegel in der Fußzeile.",
        ],
      },
      {
        id: "transfers",
        h: "Übermittlung in Drittländer",
        p: ["Ich lebe in Indien und die Dienste sitzen in den USA; Ihre Daten verlassen also die EU, wenn Sie mich kontaktieren. Die Anbieter nutzen dafür Standardvertragsklauseln oder gleichwertige Garantien."],
      },
      {
        id: "rights",
        h: "Ihre Rechte",
        p: [
          `Sie können Auskunft verlangen, was ich über Sie gespeichert habe, Berichtigung oder Löschung fordern, der Verarbeitung widersprechen oder eine Kopie erhalten. Schreiben Sie an ${MAIL}; ich antworte innerhalb von 30 Tagen. Statistik-Kennungen sind anonym und wechseln täglich, daher kann ich sie Ihnen auch auf Anfrage nicht zuordnen.`,
          "Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren.",
        ],
      },
      {
        id: "changes",
        h: "Änderungen",
        p: ["Ändert sich diese Seite, ändert sich auch das Datum oben. Größere Änderungen stehen zusätzlich im Changelog."],
      },
    ],
  },
};

const legal: Record<Lang, LegalDoc> = {
  en: {
    title: "Legal",
    lead: "Who runs this site, who owns what on it, and how to report a problem.",
    updated: UPDATED,
    sections: [
      {
        id: "operator",
        h: "Operator",
        p: [`${SITE.name}, Chennai, Tamil Nadu, India. Email: ${MAIL}. A personal, non-commercial portfolio. Full postal address on request by email.`],
      },
      {
        id: "copyright",
        h: "Copyright",
        p: [
          `© ${new Date().getFullYear()} ${SITE.name}. Unless a page says otherwise, the writing, photos, screenshots and design on this site are mine and all rights are reserved.`,
          "You're welcome to quote short passages with a link back. Code snippets in posts and notes are under the MIT license unless the post says otherwise: copy them freely.",
        ],
      },
      {
        id: "trademarks",
        h: "Names and logos",
        p: [
          "Company names, product names and logos belong to their owners. They appear here only to show where I worked or which tools I used, and don't mean those companies endorse this site. Certificates are shown as issued to me.",
        ],
      },
      {
        id: "takedown",
        h: "Copyright complaints and takedowns",
        p: [
          `If something here infringes your copyright or another right of yours, email ${MAIL} with "Takedown" in the subject. This works for DMCA notices and equivalent requests elsewhere. Please include:`,
        ],
        list: [
          "The work you own and the URL on this site where it appears.",
          "Your name, postal address, email address and phone number.",
          "A statement that you believe in good faith the use isn't authorised by you, your agent or the law.",
          "A statement that the notice is accurate and, under penalty of perjury, that you're the owner or authorised to act for them.",
          "Your physical or electronic signature (a typed full name is fine).",
        ],
      },
      {
        id: "takedown-process",
        h: "What happens next",
        p: [
          "I confirm receipt within 3 working days. If the claim holds up, the material comes down, usually within 7 days, and I'll tell you when it's gone. If I think it's a mistake, I'll explain why and you can reply; a counter-notice works the same way, by email.",
          "You can also contact the host, Vercel, through its own abuse process.",
        ],
      },
      {
        id: "links",
        h: "Links to other sites",
        p: ["I link to other sites I find useful but don't control them. If a link starts pointing somewhere it shouldn't, tell me and I'll remove it."],
      },
      {
        id: "liability",
        h: "No warranty",
        p: ["Everything here is offered as is, to show my work. I try to keep it accurate, but it isn't professional advice, and I'm not liable for decisions made on it, as far as the law allows."],
      },
      {
        id: "ai",
        h: "Use of AI",
        p: ["Parts of this site's code were written with AI coding assistants, and the German version is machine-translated. Posts say so when AI helped with the writing."],
      },
      {
        id: "security",
        h: "Security issues",
        p: [`Found a vulnerability? Email ${MAIL} with "Security" in the subject before disclosing it publicly. See /.well-known/security.txt.`],
      },
    ],
  },
  de: {
    title: "Rechtliches",
    lead: "Wer diese Seite betreibt, wem was gehört und wie Sie ein Problem melden.",
    updated: UPDATED,
    sections: [
      {
        id: "operator",
        h: "Betreiber",
        p: [`${SITE.name}, Chennai, Tamil Nadu, Indien. E-Mail: ${MAIL}. Ein persönliches, nicht kommerzielles Portfolio. Die vollständige Postanschrift auf Anfrage per E-Mail.`],
      },
      {
        id: "copyright",
        h: "Urheberrecht",
        p: [
          `© ${new Date().getFullYear()} ${SITE.name}. Sofern eine Seite nichts anderes sagt, stammen Texte, Fotos, Screenshots und Gestaltung von mir; alle Rechte vorbehalten.`,
          "Kurze Zitate mit Link sind willkommen. Code-Beispiele in Beiträgen und Notizen stehen unter der MIT-Lizenz, sofern der Beitrag nichts anderes sagt: Sie dürfen sie frei kopieren.",
        ],
      },
      {
        id: "trademarks",
        h: "Namen und Logos",
        p: [
          "Firmen- und Produktnamen sowie Logos gehören ihren Inhabern. Sie erscheinen hier nur, um zu zeigen, wo ich gearbeitet habe oder welche Werkzeuge ich nutze, und bedeuten keine Empfehlung dieser Seite durch die Unternehmen. Zertifikate werden so gezeigt, wie sie mir ausgestellt wurden.",
        ],
      },
      {
        id: "takedown",
        h: "Urheberrechtsbeschwerden und Entfernung",
        p: [
          `Verletzt etwas hier Ihr Urheberrecht oder ein anderes Recht, schreiben Sie an ${MAIL} mit „Takedown“ im Betreff. Das gilt für DMCA-Meldungen und vergleichbare Anfragen. Bitte geben Sie an:`,
        ],
        list: [
          "Das Werk, das Ihnen gehört, und die URL auf dieser Seite, unter der es erscheint.",
          "Ihren Namen, Ihre Postanschrift, E-Mail-Adresse und Telefonnummer.",
          "Eine Erklärung, dass Sie in gutem Glauben annehmen, dass die Nutzung weder von Ihnen noch von Ihrem Vertreter noch vom Gesetz gestattet ist.",
          "Eine Erklärung, dass Ihre Angaben richtig sind und Sie Rechteinhaber oder zur Vertretung berechtigt sind.",
          "Ihre Unterschrift (ein getippter vollständiger Name genügt).",
        ],
      },
      {
        id: "takedown-process",
        h: "Wie es weitergeht",
        p: [
          "Ich bestätige den Eingang innerhalb von 3 Werktagen. Ist die Beschwerde begründet, entferne ich den Inhalt, meist innerhalb von 7 Tagen, und gebe Ihnen Bescheid. Halte ich sie für unbegründet, erkläre ich warum, und Sie können antworten; eine Gegendarstellung funktioniert ebenso per E-Mail.",
          "Sie können sich auch über das Missbrauchsverfahren des Hosters Vercel melden.",
        ],
      },
      {
        id: "links",
        h: "Links zu anderen Seiten",
        p: ["Ich verlinke Seiten, die ich nützlich finde, habe aber keinen Einfluss auf sie. Führt ein Link irgendwann an einen falschen Ort, sagen Sie mir Bescheid und ich entferne ihn."],
      },
      {
        id: "liability",
        h: "Keine Gewähr",
        p: ["Alles hier wird so angeboten, wie es ist, um meine Arbeit zu zeigen. Ich bemühe mich um Richtigkeit, es handelt sich aber nicht um fachliche Beratung; eine Haftung für darauf gestützte Entscheidungen ist ausgeschlossen, soweit das Gesetz es erlaubt."],
      },
      {
        id: "ai",
        h: "Einsatz von KI",
        p: ["Teile des Codes dieser Seite wurden mit KI-Programmierassistenten geschrieben, und die deutsche Fassung ist maschinell übersetzt. Beiträge sagen es, wenn KI beim Schreiben geholfen hat."],
      },
      {
        id: "security",
        h: "Sicherheitslücken",
        p: [`Eine Schwachstelle gefunden? Schreiben Sie an ${MAIL} mit „Security“ im Betreff, bevor Sie sie veröffentlichen. Siehe /.well-known/security.txt.`],
      },
    ],
  },
};

export const LEGAL_DOCS = { privacy, legal } as const;
export type LegalKind = keyof typeof LEGAL_DOCS;
