"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, MapPin, Phone, Calendar, Users, Globe, Loader2, ChevronDown, Search, X } from "lucide-react";
import { completeProfileAction } from "./actions";

// Full list of world nationalities
const NATIONALITIES = [
    "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguan",
    "Argentine", "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian",
    "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean",
    "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Botswanan", "Brazilian",
    "Bruneian", "Bulgarian", "Burkinabé", "Burundian", "Cabo Verdean", "Cambodian",
    "Cameroonian", "Canadian", "Central African", "Chadian", "Chilean", "Chinese",
    "Colombian", "Comorian", "Congolese", "Costa Rican", "Croatian", "Cuban",
    "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch",
    "East Timorese", "Ecuadorian", "Egyptian", "Emirati", "Equatorial Guinean",
    "Eritrean", "Estonian", "Eswatini", "Ethiopian", "Fijian", "Finnish",
    "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian",
    "Greek", "Grenadian", "Guatemalan", "Guinean", "Guinea-Bissauan", "Guyanese",
    "Haitian", "Honduran", "Hungarian", "Icelandic", "Indian", "Indonesian",
    "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican",
    "Japanese", "Jordanian", "Kazakhstani", "Kenyan", "Kiribatian", "Kuwaiti",
    "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Lesothan", "Liberian",
    "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourgish", "Madagascan",
    "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese",
    "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan",
    "Mongolian", "Montenegrin", "Moroccan", "Mozambican", "Myanmarese", "Namibian",
    "Nauruan", "Nepali", "New Zealander", "Nicaraguan", "Nigerien", "Nigerian",
    "North Korean", "North Macedonian", "Norwegian", "Omani", "Pakistani",
    "Palauan", "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan",
    "Peruvian", "Philippine", "Polish", "Portuguese", "Qatari", "Romanian",
    "Russian", "Rwandan", "Saint Kittsian", "Saint Lucian", "Saint Vincentian",
    "Samoan", "Sanmarinese", "São Toméan", "Saudi Arabian", "Senegalese",
    "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovak",
    "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean",
    "South Sudanese", "Spanish", "Sri Lankan", "Sudanese", "Surinamese",
    "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai",
    "Togolese", "Tongan", "Trinidadian", "Tunisian", "Turkish", "Turkmen",
    "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", "Vanuatuan",
    "Venezuelan", "Vietnamese", "Yemeni", "Zambian", "Zimbabwean"
];

function NationalityCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = NATIONALITIES.filter(n =>
        n.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (nationality: string) => {
        onChange(nationality);
        setOpen(false);
        setSearch("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearch("");
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Hidden real input for form submission */}
            <input type="hidden" name="nationality" value={value} />

            {/* Trigger button */}
            <button
                type="button"
                onClick={() => {
                    setOpen(!open);
                    setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className={`w-full h-11 border rounded-md px-3 text-sm flex items-center justify-between bg-white transition-all outline-none
                    ${open ? "border-[#1E3A8A] ring-1 ring-[#1E3A8A]" : "border-gray-200 hover:border-gray-300"}
                    ${!value ? "text-gray-400" : "text-gray-900"}`}
            >
                <span className="truncate">{value || "Select your nationality"}</span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    {value && (
                        <span
                            onClick={handleClear}
                            className="p-0.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </span>
                    )}
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    {/* Search bar */}
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                        <Search size={14} className="text-gray-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search nationality..."
                            className="flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400 bg-transparent"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-400 italic">No nationality found</div>
                        ) : (
                            filtered.map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => handleSelect(n)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-[#1E3A8A]
                                        ${value === n ? "bg-blue-50 text-[#1E3A8A] font-semibold" : "text-gray-700"}`}
                                >
                                    {n}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CompleteProfilePage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nationality, setNationality] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!nationality) {
            setError("Please select your nationality.");
            return;
        }
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const res = await completeProfileAction(formData);

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    }

    if (isPending) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>;
    }

    if (!session) {
        router.push("/sign-in");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <Card className="w-full max-w-2xl shadow-xl border-gray-100 overflow-hidden">
                <div className="h-2 w-full bg-[#1E3A8A]" />
                <CardHeader className="pt-8 pb-4 text-center">
                    <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-[#1E3A8A]" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Complete Your Profile</CardTitle>
                    <CardDescription className="text-gray-500 mt-2">
                        We need a few more details before you can start your immigration journey.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date of Birth */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" /> Date of Birth
                                </label>
                                <Input
                                    name="dateOfBirth"
                                    type="date"
                                    className="h-11 border-gray-200 focus:ring-[#1E3A8A]"
                                    required
                                />
                            </div>

                            {/* Nationality — Searchable Combobox */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-blue-500" /> Nationality
                                </label>
                                <NationalityCombobox value={nationality} onChange={setNationality} />
                            </div>

                            {/* Marital Status */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" /> Marital Status
                                </label>
                                <select
                                    name="maritalStatus"
                                    className="w-full h-11 border border-gray-200 rounded-md bg-white px-3 text-sm focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="SINGLE">Single</option>
                                    <option value="MARRIED">Married</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                            </div>

                            {/* Number of Children */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" /> Number of Children
                                </label>
                                <Input
                                    name="numberOfChildren"
                                    type="number"
                                    min="0"
                                    defaultValue="0"
                                    className="h-11 border-gray-200 focus:ring-[#1E3A8A]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-500" /> Phone Number
                            </label>
                            <Input
                                name="phoneNumber"
                                type="tel"
                                placeholder="+1 234 567 8900"
                                className="h-11 border-gray-200 focus:ring-[#1E3A8A]"
                                required
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-500" /> Detailed Address
                            </label>
                            <textarea
                                name="address"
                                maxLength={255}
                                className="w-full min-h-[100px] border border-gray-200 rounded-md bg-white p-3 text-sm focus:ring-1 focus:ring-[#1E3A8A] outline-none resize-none"
                                placeholder="Street, City, Province, Country (Max 255 chars)"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#1E3A8A] hover:bg-blue-900 h-12 text-base font-bold transition-all shadow-md mt-4"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Complete Profile & Start Application"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
