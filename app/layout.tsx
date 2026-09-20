import "./globals.css";
export const metadata = { title:"THARA — Personal AI", description:"Self-improving personal AI assistant" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}