import { ImageResponse } from "next/og";

const TENOR_SANS_URL =
  "https://fonts.gstatic.com/s/tenorsans/v21/bx6ANxqUneKx06UkIXISr3I.ttf";

let tenorSansData: ArrayBuffer | null = null;

async function loadTenorSans(): Promise<ArrayBuffer> {
  if (tenorSansData) return tenorSansData;
  const data = await fetch(TENOR_SANS_URL).then((res) => res.arrayBuffer());
  tenorSansData = data;
  return data;
}

export async function dBrandIcon(size: number) {
  const font = await loadTenorSans();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#000000",
            color: "#ffffff",
            fontFamily: "Tenor Sans",
            fontSize: Math.round(size * 0.68),
            fontWeight: 400,
            letterSpacing: "-0.04em",
          }}
        >
          D
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [
        {
          name: "Tenor Sans",
          data: font,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
