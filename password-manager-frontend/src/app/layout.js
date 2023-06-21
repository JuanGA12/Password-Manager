import './globals.css';

export const metadata = {
  title: 'Password Manager',
  description: 'Password Manager by Chunte',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
