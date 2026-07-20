import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// This root layout is a pass-through because the localized layout under app/[locale]/layout.tsx handles the actual html/body tags
export default function RootLayout({ children }: Props) {
  return children;
}
