"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ContactAgencyModal from "@/components/ContactAgencyModal";

/**
 * Drop-in replacement for `<Link href="/contact"><Button>...</Button></Link>`.
 * Opens the Contact Agency popup instead of navigating to a page — usable
 * from Server Components since it manages its own open/close state.
 */
export default function ContactAgencyButton({
    label,
    className,
}: {
    label: string;
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)} className={className}>
                {label}
            </Button>
            <ContactAgencyModal open={open} onOpenChange={setOpen} />
        </>
    );
}