import type { Metadata } from "next";
import { Toaster } from "sonner";
import { extractRouterConfig } from "uploadthing/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: "ATLE Immigration - Admin",
  description: "Admin dashboard for ATLE Immigration",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NextSSRPlugin
        routerConfig={extractRouterConfig(ourFileRouter)}
      />
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}
