import { Question } from "./types";

/**
 * Asked first, right after personal details — this is the branch point:
 * every question after this one (except the other shared sections) comes
 * from the matching country module in ./canada.ts, ./france.ts, ./germany.ts
 */
export const destinationQuestion: Question = {
    id: "destinationCountry",
    section: "destination",
    label: "Dans quel pays souhaitez-vous immigrer ?",
    type: "radio",
    required: true,
    options: [
        { value: "CANADA", label: "Canada" },
        { value: "FRANCE", label: "France" },
        { value: "GERMANY", label: "Allemagne" },
        { value: "OTHER", label: "Autre" },
    ],
};

export const personalDetailsQuestions: Question[] = [
    {
        id: "fullName",
        section: "personalDetails",
        label: "Quel est votre nom complet ?",
        placeholder: "Exemple : TAGNE YVAN JOËL",
        type: "text",
        required: true,
        profileField: "name",
    },
    {
        id: "phone",
        section: "personalDetails",
        label: "Votre numéro de téléphone (WhatsApp de préférence)",
        type: "phone",
        required: true,
        profileField: "phoneNumber",
    },
    {
        id: "dateOfBirth",
        section: "personalDetails",
        label: "Quelle est votre date de naissance ?",
        type: "date",
        required: true,
        profileField: "dateOfBirth",
    },
    {
        id: "countryOfResidence",
        section: "personalDetails",
        label: "Quel est votre pays de résidence actuel ?",
        type: "country",
        required: true,
    },
    {
        id: "cityOfResidence",
        section: "personalDetails",
        label: "Quelle est votre ville de résidence actuelle ?",
        placeholder: "Exemple : Yaoundé",
        type: "text",
        required: true,
        profileField: "address",
    },
    {
        id: "passportStatus",
        section: "personalDetails",
        label: "Détenez-vous un passeport valide (avec votre profession y indiquée) ?",
        type: "radio",
        required: true,
        options: [
            { value: "VALID_WITH_PROFESSION", label: "Oui, j'ai un passeport valide et ma profession y est indiquée" },
            { value: "VALID_NO_PROFESSION", label: "Oui, j'ai un passeport valide, mais ma profession n'y est pas indiquée" },
            { value: "NONE", label: "Non, je n'ai pas de passeport valide" },
        ],
        documentType: "PASSPORT",
    },
];

export const academicQuestions: Question[] = [
    {
        id: "educationLevel",
        section: "academic",
        label: "Quel est votre niveau d'étude ?",
        type: "select",
        required: true,
        options: [
            { value: "NONE", label: "BEPC (sans diplôme)" },
            { value: "BAC", label: "Baccalauréat" },
            { value: "BTS", label: "BTS" },
            { value: "LICENCE", label: "Licence" },
            { value: "MASTER", label: "Master" },
            { value: "DOCTORATE", label: "Doctorat" },
            { value: "OTHER", label: "Autre" },
        ],
    },
    {
        id: "educationLevelOther",
        section: "academic",
        label: "Veuillez préciser votre niveau d'étude",
        type: "text",
        required: true,
        condition: [{ questionId: "educationLevel", equals: "OTHER" }],
    },

    // --- Main diploma details — shown for every level except "sans diplôme" ---
    {
        id: "diplomaDate",
        section: "academicMain",
        label: "Mois et année d'obtention de ce diplôme",
        placeholder: "Exemple : Juillet 2022",
        type: "text",
        required: true,
        condition: [{ questionId: "educationLevel", notEquals: "NONE" }],
    },
    {
        id: "diplomaSchool",
        section: "academicMain",
        label: "École / Université qui a délivré ce diplôme",
        placeholder: "Exemple : Université de Douala",
        type: "text",
        required: true,
        condition: [{ questionId: "educationLevel", notEquals: "NONE" }],
    },
    {
        id: "diplomaField",
        section: "academicMain",
        label: "Filière d'étude de ce diplôme",
        placeholder: "Exemple : Comptabilité et finance",
        type: "text",
        required: true,
        condition: [{ questionId: "educationLevel", notEquals: "NONE" }],
    },
    {
        id: "hasOtherDiploma",
        section: "academicMain",
        label: "Avez-vous un autre diplôme ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
        condition: [{ questionId: "educationLevel", notEquals: "NONE" }],
    },

    // --- Second diploma details — shown if they said they have another one ---
    {
        id: "diploma2Date",
        section: "academicSecond",
        label: "Mois et année d'obtention de cet autre diplôme",
        placeholder: "Exemple : Juillet 2022",
        type: "text",
        required: true,
        condition: [{ questionId: "hasOtherDiploma", equals: "YES" }],
    },
    {
        id: "diploma2School",
        section: "academicSecond",
        label: "École / Université qui a délivré cet autre diplôme",
        placeholder: "Exemple : Université de Douala",
        type: "text",
        required: true,
        condition: [{ questionId: "hasOtherDiploma", equals: "YES" }],
    },
    {
        id: "diploma2Field",
        section: "academicSecond",
        label: "Filière d'étude de cet autre diplôme",
        placeholder: "Exemple : Comptabilité et finance",
        type: "text",
        required: true,
        condition: [{ questionId: "hasOtherDiploma", equals: "YES" }],
    },
];

export const experienceQuestions: Question[] = [
    {
        id: "hasExperience",
        section: "experience",
        label: "Avez-vous de l'expérience professionnelle justifiable ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
    },
    {
        id: "job1Title",
        section: "experienceJob1",
        label: "Quelle est votre profession dans le cadre de cette expérience professionnelle ?",
        type: "text",
        required: true,
        condition: [{ questionId: "hasExperience", equals: "YES" }],
    },
    {
        id: "job1StartDate",
        section: "experienceJob1",
        label: "Date de début de l'emploi",
        type: "monthYear",
        required: true,
        condition: [{ questionId: "hasExperience", equals: "YES" }],
    },
    {
        id: "job1EndDate",
        section: "experienceJob1",
        label: "Date de fin de l'emploi",
        type: "monthYear",
        allowPresent: true,
        required: true,
        condition: [{ questionId: "hasExperience", equals: "YES" }],
    },
    {
        id: "job1Proof",
        section: "experienceJob1",
        label: "Êtes-vous en mesure de fournir des preuves de cette expérience professionnelle ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
        condition: [{ questionId: "hasExperience", equals: "YES" }],
    },
    {
        id: "hasOtherJob",
        section: "experienceJob1",
        label: "Avez-vous une autre expérience de travail dans une autre entreprise ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
        condition: [{ questionId: "hasExperience", equals: "YES" }],
    },
    {
        id: "job2Title",
        section: "experienceJob2",
        label: "Quelle est votre profession dans le cadre de cette autre expérience professionnelle ?",
        type: "text",
        required: true,
        condition: [
            { questionId: "hasExperience", equals: "YES" },
            { questionId: "hasOtherJob", equals: "YES" },
        ],
    },
    {
        id: "job2StartDate",
        section: "experienceJob2",
        label: "Date de début de l'emploi",
        type: "monthYear",
        required: true,
        condition: [
            { questionId: "hasExperience", equals: "YES" },
            { questionId: "hasOtherJob", equals: "YES" },
        ],
    },
    {
        id: "job2EndDate",
        section: "experienceJob2",
        label: "Date de fin de l'emploi",
        type: "monthYear",
        allowPresent: true,
        required: true,
        condition: [
            { questionId: "hasExperience", equals: "YES" },
            { questionId: "hasOtherJob", equals: "YES" },
        ],
    },
    {
        id: "job2Proof",
        section: "experienceJob2",
        label: "Êtes-vous en mesure de fournir des preuves de cette autre expérience professionnelle ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
        condition: [
            { questionId: "hasExperience", equals: "YES" },
            { questionId: "hasOtherJob", equals: "YES" },
        ],
    },
];

export const financialQuestions: Question[] = [
    {
        id: "hasProofOfFunds",
        section: "financial",
        label: "Avez-vous une preuve de fonds valide ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
    },
];

export const familyQuestions: Question[] = [
    {
        id: "hasCanadianFamily",
        section: "family",
        label: "Avez-vous un frère/sœur ou parent de plus de 18 ans qui réside dans le pays visé, ou qui en a la nationalité ?",
        helpText: "Il s'agit ici de la famille directe (les cousins/cousines et oncles/tantes, neveux/nièces sont exclus)",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
    },
    {
        id: "travelMotivation",
        section: "family",
        label: "Quelle est votre motivation de voyage ?",
        type: "radio",
        required: true,
        options: [
            { value: "STUDIES", label: "Études" },
            { value: "EMPLOYMENT", label: "Emploi" },
            { value: "FAMILY", label: "Famille" },
            { value: "TOURISM", label: "Tourisme" },
            { value: "BUSINESS", label: "Affaires" },
            { value: "OTHER", label: "Autre" },
        ],
    },
    {
        id: "numberOfChildren",
        section: "family",
        label: "Combien d'enfant(s) avez-vous (les enfants de votre conjoint y compris) ?",
        helpText: "Les enfants doivent être les vôtres, c'est-à-dire votre nom doit figurer sur l'acte de naissance comme étant le parent.",
        type: "select",
        required: true,
        options: [
            { value: "0", label: "00" },
            { value: "1", label: "01" },
            { value: "2", label: "02" },
            { value: "3", label: "03" },
            { value: "4", label: "04" },
            { value: "5", label: "05" },
            { value: "6+", label: "+ de 5" },
        ],
    },
    {
        id: "numberOfAccompanyingChildren",
        section: "family",
        label: "Combien d'enfant(s) vous accompagneront (les enfants de votre conjoint y compris) ?",
        type: "select",
        required: true,
        options: [
            { value: "0", label: "00" },
            { value: "1", label: "01" },
            { value: "2", label: "02" },
            { value: "3", label: "03" },
            { value: "4", label: "04" },
            { value: "5", label: "05" },
            { value: "6+", label: "+ de 5" },
        ],
    },
    {
        id: "maritalStatus",
        section: "family",
        label: "Quel est votre statut matrimonial ?",
        type: "radio",
        required: true,
        profileField: "maritalStatus",
        options: [
            { value: "SINGLE", label: "Célibataire" },
            { value: "MARRIED", label: "Marié(e)" },
            { value: "COMMON_LAW", label: "Conjoint(e) de fait" },
        ],
    },

    // --- Spouse / common-law partner details ---
    {
        id: "spouseAccompanying",
        section: "spouse",
        label: "Est-ce que votre conjoint(e) vous accompagnera ?",
        type: "checkbox",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
        condition: [{ questionId: "maritalStatus", in: ["MARRIED", "COMMON_LAW"] }],
    },
    {
        id: "spouseName",
        section: "spouse",
        label: "Nom du conjoint",
        type: "text",
        required: true,
        condition: [{ questionId: "maritalStatus", in: ["MARRIED", "COMMON_LAW"] }],
    },
    {
        id: "spouseAge",
        section: "spouse",
        label: "Âge du conjoint",
        type: "number",
        required: true,
        condition: [{ questionId: "maritalStatus", in: ["MARRIED", "COMMON_LAW"] }],
    },
    {
        id: "spouseAcademicLevel",
        section: "spouse",
        label: "Niveau académique du conjoint",
        helpText: "Quel est son diplôme le plus élevé, avec l'année d'obtention. Exemple : BEPC session 2019",
        type: "text",
        required: true,
        condition: [{ questionId: "maritalStatus", in: ["MARRIED", "COMMON_LAW"] }],
    },
    {
        id: "spouseHasEquivalence",
        section: "spouse",
        label: "Votre conjoint a-t-il une équivalence de diplôme ?",
        type: "radio",
        required: true,
        options: [
            { value: "YES", label: "Oui" },
            { value: "NO", label: "Non" },
        ],
        condition: [{ questionId: "maritalStatus", in: ["MARRIED", "COMMON_LAW"] }],
    },
    {
        id: "spouseExperienceYears",
        section: "spouse",
        label: "Nombre d'années d'expérience professionnelle du conjoint",
        helpText: "Assurez-vous que cette expérience peut être prouvée",
        type: "number",
        required: true,
        condition: [{ questionId: "maritalStatus", in: ["MARRIED", "COMMON_LAW"] }],
    },
];