import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LumiChess Board Foundation',
  description: 'Premium interactive chessboard foundation for LumiChess'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}

        <form
          name="newsletter"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          hidden
          aria-hidden="true"
        >
          <input type="hidden" name="form-name" value="newsletter" />
          <input type="email" name="email" />
          <input name="bot-field" />
        </form>
      </body>
    </html>
  );
}
