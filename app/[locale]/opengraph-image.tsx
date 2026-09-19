import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 1200, height: 1200 };
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
                    backgroundColor: "#FFFFFF",
                    gap: 40,
                    padding: 80,
                    textAlign: "center",
                }}
            >
                <img
                    src={logoBase64}
                    width={340}
                    height={340}
                />
                <div
                    style={{
                        color: "#1E3A8A",
                        fontSize: 76,
                        fontWeight: 800,
                        letterSpacing: -1,
                    }}
                >
                    Procédure Facile
                </div>
                <div
                    style={{
                        color: "#64748B",
                        fontSize: 34,
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