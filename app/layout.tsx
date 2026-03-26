import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RCCG Revelation Sanctuary - Oasis of Excellence',
  description: 'Official digital platform of RCCG Revelation Sanctuary, Region 30 HQ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Header />
          <main className="grow">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#0EBC5F',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#CB0000',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}





































































// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import Header from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';
// import { AuthProvider } from '@/hooks/useAuth';
// import { Toaster } from 'react-hot-toast';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'RCCG Revelation Sanctuary - Oasis of Excellence',
//   description: 'Official digital platform of RCCG Revelation Sanctuary, Region 30 HQ',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} flex flex-col min-h-screen`}>
//         <AuthProvider>
//           <Header />
//           <main className="grow">
//             {children}
//           </main>
//           <Footer />
//           <Toaster position="top-right" />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }