// app/layout.tsx

import "maplibre-gl/dist/maplibre-gl.css";
import React, { ReactNode } from "react";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
