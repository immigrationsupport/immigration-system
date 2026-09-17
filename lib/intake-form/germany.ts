import { Question } from "./types";

/**
 * Sources checked before writing these (Sept 2026): the ZAB (Zentralstelle
 * für ausländisches Bildungswesen) maintains the anabin database — H+
 * means recognized, H+/- means case-by-case, H- means not recognized. If
 * a degree isn't listed, a ZAB Statement of Comparability (Zeugnisbewertung,
 * ~208€, 2-3 months) is needed. Language tests are typically Goethe-Institut,
 * telc, or TestDaF for German; an EU Blue Card application can also require
 * proof of a signed job contract above a salary threshold.
 */
export const germanyModule: Question[] = [
    {
        id: "de_hasVisaApplication",
        section: "de_immigration",
        label: "Avez-vous déjà fait une demande de visa ou de titre de séjour auprès des autorités allemandes dans le passé ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
    },
    {
        id: "de_visaDetails",
        section: "de_immigration",
        label: "Veuillez préciser les détails de la demande faite et la décision reçue.",
        type: "textarea",
        required: false,
        condition: [{ questionId: "de_hasVisaApplication", equals: "YES" }],
    },
    {
        id: "de_immigrationGoal",
        section: "de_immigration",
        label: "Quel est l'objectif principal de votre démarche en Allemagne ?",
        type: "radio",
        required: true,
        options: [
            { value: "BLUE_CARD", label: "Carte Bleue Européenne (emploi qualifié)" },
            { value: "SKILLED_WORKER", label: "Visa travailleur qualifié" },
            { value: "STUDIES", label: "Études" },
            { value: "FAMILY", label: "Regroupement familial" },
        ],
    },
    {
        id: "de_hasJobOffer",
        section: "de_immigration",
        label: "Avez-vous déjà un contrat de travail signé en Allemagne ?",
        helpText: "Nécessaire pour la Carte Bleue Européenne, avec un salaire brut au-dessus d'un certain seuil",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
        condition: [{ questionId: "de_immigrationGoal", equals: "BLUE_CARD" }],
    },

    // --- Diploma equivalence for Germany is the ANABIN check / ZAB certificate ---
    {
        id: "de_diplomaAnabin",
        section: "academicMain",
        label: "Avez-vous vérifié si ce diplôme est reconnu dans la base ANABIN, ou obtenu un certificat ZAB ?",
        helpText: "ANABIN classe les diplômes en H+ (reconnu), H+/- (au cas par cas) ou H- (non reconnu). Si non listé, une évaluation ZAB (Zeugnisbewertung) est nécessaire.",
        type: "radio",
        required: true,
        options: [
            { value: "H_PLUS", label: "Oui, classé H+ (reconnu)" },
            { value: "H_PLUS_MINUS", label: "Oui, classé H+/- (au cas par cas)" },
            { value: "ZAB_IN_PROGRESS", label: "Certificat ZAB en cours" },
            { value: "NOT_CHECKED", label: "Pas encore vérifié" },
        ],
        condition: [{ questionId: "educationLevel", notEquals: "NONE" }],
    },
    {
        id: "de_diploma2Anabin",
        section: "academicSecond",
        label: "Avez-vous vérifié si cet autre diplôme est reconnu dans la base ANABIN, ou obtenu un certificat ZAB ?",
        type: "radio",
        required: true,
        options: [
            { value: "H_PLUS", label: "Oui, classé H+ (reconnu)" },
            { value: "H_PLUS_MINUS", label: "Oui, classé H+/- (au cas par cas)" },
            { value: "ZAB_IN_PROGRESS", label: "Certificat ZAB en cours" },
            { value: "NOT_CHECKED", label: "Pas encore vérifié" },
        ],
        condition: [{ questionId: "hasOtherDiploma", equals: "YES" }],
    },

    // --- Language tests — German (Goethe/telc/TestDaF), plus English for Blue Card roles taught/worked in English ---
    {
        id: "de_hasGermanTest",
        section: "language",
        label: "Avez-vous un test de langue allemande ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
    },
    {
        id: "de_germanTestType",
        section: "language",
        label: "Quel test avez-vous fait ?",
        helpText: "Si vous avez fait plusieurs tests, indiquez celui avec votre meilleur résultat.",
        type: "radio",
        required: true,
        options: [
            { value: "GOETHE", label: "Goethe-Institut" },
            { value: "TELC", label: "telc" },
            { value: "TESTDAF", label: "TestDaF" },
            { value: "OSD", label: "ÖSD" },
            { value: "OTHER", label: "Autre" },
        ],
        condition: [{ questionId: "de_hasGermanTest", equals: "YES" }],
        documentType: "LANGUAGE_REGISTRATION",
    },
    {
        id: "de_germanLevel",
        section: "language",
        label: "Quel niveau avez-vous obtenu (A1 à C2, ou score TestDaF) ?",
        placeholder: "Exemple : B2 ou TestDaF 4",
        type: "text",
        required: true,
        condition: [{ questionId: "de_hasGermanTest", equals: "YES" }],
        documentType: "LANGUAGE_RESULT",
    },
    {
        id: "de_hasEnglishTest",
        section: "language",
        label: "Avez-vous un test de langue anglaise (utile pour un poste ou un programme en anglais) ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
    },
    {
        id: "de_englishTestType",
        section: "language",
        label: "Quel test de langue anglaise avez-vous fait ?",
        type: "radio",
        required: true,
        options: [
            { value: "IELTS", label: "IELTS" },
            { value: "TOEFL", label: "TOEFL" },
            { value: "OTHER", label: "Autre" },
        ],
        condition: [{ questionId: "de_hasEnglishTest", equals: "YES" }],
        documentType: "LANGUAGE_REGISTRATION",
    },

    {
        id: "de_preferredRegion",
        section: "lifeInCountry",
        label: "Dans quel Land/ville d'Allemagne aimeriez-vous vous installer ?",
        helpText: "Vous pouvez en citer plusieurs. Exemple : Bavière / Berlin / Hambourg",
        type: "text",
        required: true,
    },

    // --- Spouse ---
    {
        id: "de_spouseLanguageTest",
        section: "spouseLanguage",
        label: "Quel(s) test(s) de langue allemande le conjoint a-t-il ?",
        type: "radio",
        required: true,
        options: [
            { value: "NONE", label: "Aucun test de langue" },
            { value: "GOETHE", label: "Goethe-Institut" },
            { value: "TELC", label: "telc" },
            { value: "TESTDAF", label: "TestDaF" },
        ],
        condition: [{ questionId: "maritalStatus", in: ["MARRIED", "COMMON_LAW"] }],
    },
    {
        id: "de_spouseLevel",
        section: "spouseLanguage",
        label: "Son niveau obtenu",
        placeholder: "Exemple : A2",
        type: "text",
        required: false,
        condition: [
            { questionId: "maritalStatus", in: ["MARRIED", "COMMON_LAW"] },
            { questionId: "de_spouseLanguageTest", notEquals: "NONE" },
        ],
    },
];