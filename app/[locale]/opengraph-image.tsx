import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
    const logoPath = path.join(process.cwd(), "public/logos/logo-icon.png");
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1E3A8A",
                    gap: 28,
                }}
            >
                <img
                    src={logoBase64}
                    width={200}
                    height={200}
                    style={{ borderRadius: 28 }}
                />
                <div
                    style={{
                        color: "white",
                        fontSize: 64,
                        fontWeight: 800,
                        letterSpacing: -1,
                    }}
                >
                    Procédure Facile
                </div>
                <div
                    style={{
                        color: "#93C5FD",
                        fontSize: 28,
                        fontWeight: 500,
                    }}
                >
                    Cabinet de conseil professionnel en immigration
                </div>
            </div>
        ),
        { ...size }
    );
}