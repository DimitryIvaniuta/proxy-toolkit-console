import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import { Shell } from "../components/layout/Shell";

export const metadata = {
  title: "Proxy Toolkit Console",
  description: "Frontend console for Spring Proxy Toolkit backend",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
