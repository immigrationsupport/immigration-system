import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as "en" | "fr")) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: locale === "fr" ? fr : en,
    };
});