import "./globals.css";
import { Navbar, ChatPanel } from "./components";

export const metadata = {
  title: "Vylaro - Budget AI Fitness & Nutrition Guidance",
  description: "Affordable AI fitness guidance for everyday people. Workout generators, budget meal plans, dynamic recipes, and progress logs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <ChatPanel />
        </div>
      </body>
    </html>
  );
}

