import { getCountries, getCountryCallingCode } from "libphonenumber-js";

export interface Country {
    code: string; // ISO 3166-1 alpha-2
    name: string; // French display name, from Intl.DisplayNames
    dialCode: string;
}

const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });

/**
 * Built from libphonenumber-js's own country/calling-code data (the same
 * dataset phone libraries use worldwide) instead of a hand-typed list, so
 * it's complete and accurate. Names come from the browser/Node's own
 * Intl.DisplayNames rather than being typed out by hand. Sorted
 * alphabetically by French name.
 */
export const COUNTRIES: Country[] = getCountries()
    .map((code) => ({
        code,
        name: regionNames.of(code) || code,
        dialCode: `+${getCountryCallingCode(code)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

export function findCountryByDialCode(dialCode: string): Country | undefined {
    return COUNTRIES.find((c) => c.dialCode === dialCode);
}