export type QuestionType =
    | "text"
    | "textarea"
    | "radio"
    | "checkbox"
    | "date"
    | "select"
    | "number"
    | "upload"
    | "phone"
    | "country"
    | "monthYear";

export interface QuestionOption {
    value: string;
    label: string;
}

/**
 * A single condition checked against previously-given answers. All
 * conditions in a question's `condition` array must be true (AND) for the
 * question to be shown.
 */
export interface Condition {
    questionId: string;
    equals?: string;
    in?: string[];
    notEquals?: string;
}

export interface Question {
    id: string;
    section: string;
    label: string;
    helpText?: string;
    placeholder?: string;
    type: QuestionType;
    options?: QuestionOption[];
    required?: boolean;
    condition?: Condition[];
    /**
     * If set, this answer is written directly onto the client's User/profile
     * record on submission (see lib/intake-form/engine.ts -> syncProfileFields).
     */
    profileField?: string;
    /**
     * If type === "upload", the DocumentType this file should be saved
     * under when the client attaches it.
     */
    documentType?: string;
    /**
     * For type === "monthYear" only — when true, shows an "En cours"
     * checkbox that stores the special value "PRESENT" instead of a date
     * (used for an end date that may still be ongoing).
     */
    allowPresent?: boolean;
    /**
     * For type === "number" only — caps the value based on another
     * question's answer (e.g. the chosen test type), so a TCF score can't
     * exceed 20 while a TEF score can't exceed 699. `default` applies when
     * the sibling answer isn't in `map` (e.g. "OTHER" test — no cap).
     */
    maxFromAnswer?: { questionId: string; map: Record<string, number>; default?: number };
    /**
     * For type === "number" only — a fixed cap that doesn't depend on any
     * other answer (e.g. CO/CE scores are capped at 699 regardless of
     * which test was chosen). Ignored if maxFromAnswer is also set.
     */
    max?: number;
}

export interface CountryModule {
    id: string;
    label: string;
    questions: Question[];
}

export type Answers = Record<string, any>;