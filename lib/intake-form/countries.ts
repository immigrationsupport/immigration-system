export interface Country {
    code: string; // ISO 3166-1 alpha-2
    name: string; // French display name
    dialCode: string;
}

/**
 * Not exhaustive down to every micro-territory, but covers the vast
 * majority of realistic client origins for a Francophone immigration
 * agency — West/Central Africa first (most common), then the rest of
 * Africa, Europe, North America, and other major regions.
 */
export const COUNTRIES: Country[] = [
    { code: "CM", name: "Cameroun", dialCode: "+237" },
    { code: "CI", name: "Côte d'Ivoire", dialCode: "+225" },
    { code: "SN", name: "Sénégal", dialCode: "+221" },
    { code: "ML", name: "Mali", dialCode: "+223" },
    { code: "BF", name: "Burkina Faso", dialCode: "+226" },
    { code: "NE", name: "Niger", dialCode: "+227" },
    { code: "TG", name: "Togo", dialCode: "+228" },
    { code: "BJ", name: "Bénin", dialCode: "+229" },
    { code: "GN", name: "Guinée", dialCode: "+224" },
    { code: "GA", name: "Gabon", dialCode: "+241" },
    { code: "CG", name: "Congo-Brazzaville", dialCode: "+242" },
    { code: "CD", name: "RD Congo", dialCode: "+243" },
    { code: "TD", name: "Tchad", dialCode: "+235" },
    { code: "CF", name: "République centrafricaine", dialCode: "+236" },
    { code: "GQ", name: "Guinée équatoriale", dialCode: "+240" },
    { code: "MR", name: "Mauritanie", dialCode: "+222" },
    { code: "GW", name: "Guinée-Bissau", dialCode: "+245" },
    { code: "GH", name: "Ghana", dialCode: "+233" },
    { code: "NG", name: "Nigéria", dialCode: "+234" },
    { code: "MA", name: "Maroc", dialCode: "+212" },
    { code: "DZ", name: "Algérie", dialCode: "+213" },
    { code: "TN", name: "Tunisie", dialCode: "+216" },
    { code: "LY", name: "Libye", dialCode: "+218" },
    { code: "EG", name: "Égypte", dialCode: "+20" },
    { code: "RW", name: "Rwanda", dialCode: "+250" },
    { code: "BI", name: "Burundi", dialCode: "+257" },
    { code: "MG", name: "Madagascar", dialCode: "+261" },
    { code: "KE", name: "Kenya", dialCode: "+254" },
    { code: "ET", name: "Éthiopie", dialCode: "+251" },
    { code: "ZA", name: "Afrique du Sud", dialCode: "+27" },
    { code: "AO", name: "Angola", dialCode: "+244" },
    { code: "MZ", name: "Mozambique", dialCode: "+258" },
    { code: "CV", name: "Cap-Vert", dialCode: "+238" },
    { code: "DJ", name: "Djibouti", dialCode: "+253" },
    { code: "KM", name: "Comores", dialCode: "+269" },
    { code: "SC", name: "Seychelles", dialCode: "+248" },
    { code: "FR", name: "France", dialCode: "+33" },
    { code: "BE", name: "Belgique", dialCode: "+32" },
    { code: "CH", name: "Suisse", dialCode: "+41" },
    { code: "LU", name: "Luxembourg", dialCode: "+352" },
    { code: "DE", name: "Allemagne", dialCode: "+49" },
    { code: "GB", name: "Royaume-Uni", dialCode: "+44" },
    { code: "IT", name: "Italie", dialCode: "+39" },
    { code: "ES", name: "Espagne", dialCode: "+34" },
    { code: "PT", name: "Portugal", dialCode: "+351" },
    { code: "NL", name: "Pays-Bas", dialCode: "+31" },
    { code: "SE", name: "Suède", dialCode: "+46" },
    { code: "NO", name: "Norvège", dialCode: "+47" },
    { code: "FI", name: "Finlande", dialCode: "+358" },
    { code: "DK", name: "Danemark", dialCode: "+45" },
    { code: "IE", name: "Irlande", dialCode: "+353" },
    { code: "AT", name: "Autriche", dialCode: "+43" },
    { code: "PL", name: "Pologne", dialCode: "+48" },
    { code: "GR", name: "Grèce", dialCode: "+30" },
    { code: "TR", name: "Turquie", dialCode: "+90" },
    { code: "RU", name: "Russie", dialCode: "+7" },
    { code: "UA", name: "Ukraine", dialCode: "+380" },
    { code: "CA", name: "Canada", dialCode: "+1" },
    { code: "US", name: "États-Unis", dialCode: "+1" },
    { code: "MX", name: "Mexique", dialCode: "+52" },
    { code: "BR", name: "Brésil", dialCode: "+55" },
    { code: "AR", name: "Argentine", dialCode: "+54" },
    { code: "HT", name: "Haïti", dialCode: "+509" },
    { code: "CN", name: "Chine", dialCode: "+86" },
    { code: "IN", name: "Inde", dialCode: "+91" },
    { code: "JP", name: "Japon", dialCode: "+81" },
    { code: "KR", name: "Corée du Sud", dialCode: "+82" },
    { code: "AE", name: "Émirats arabes unis", dialCode: "+971" },
    { code: "SA", name: "Arabie saoudite", dialCode: "+966" },
    { code: "QA", name: "Qatar", dialCode: "+974" },
    { code: "LB", name: "Liban", dialCode: "+961" },
    { code: "AU", name: "Australie", dialCode: "+61" },
    { code: "NZ", name: "Nouvelle-Zélande", dialCode: "+64" },
    { code: "OT", name: "Autre pays", dialCode: "" },
];

export function findCountryByDialCode(dialCode: string): Country | undefined {
    return COUNTRIES.find((c) => c.dialCode === dialCode);
}