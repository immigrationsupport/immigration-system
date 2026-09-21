import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 1200, height: 1200 };
export const contentType = "image/png";

export default async function OpengraphImage() {
    const logoPath = path.join(process.cwd(), "public/logos/logo-vertical.png");
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#FFFFFF",
                }}
            >
                <img
                    src={logoBase64}
                    width={1000}
                    height={1000}
                />
            </div>
        ),
        { ...size }
    );
}