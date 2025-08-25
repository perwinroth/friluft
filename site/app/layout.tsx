export const metadata = {
  title: 'Friluft – Upptäck och boka friluftsupplevelser',
  description: 'Sök bland platser och upplevelser för friluftsliv i Sverige – vandring, paddling, camping m.m.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          :root { --accent: #0f766e; }
          html, body { margin:0; padding:0; font-family: 'Inter', system-ui, sans-serif; }
          a { color: var(--accent); text-decoration: none; }
          .container { max-width: 1100px; margin: 0 auto; padding: 16px; }
          .grid { display:grid; grid-template-columns: 2fr 1fr; gap: 16px; }
          @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
          .card { border: 1px solid #eee; border-radius: 10px; padding: 12px; }
          .pill { border:1px solid #e6e6e6; border-radius:999px; padding:10px 14px; display:flex; gap:10px; align-items:center; box-shadow:0 4px 16px rgba(0,0,0,0.06); }
          input[type=text] { border:0; outline:0; width:100%; font-size:14px; }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

