import { Space_Grotesk } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"
import './globals.css';

const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
	title: 'nullsiebenneun',
	description: 'nullsiebenneun archive by vivi jordi',
};

export default function RootLayout({ children }) {
	return (
		<html lang="de">
			<body className={`${spaceGrotesk.className} bg-white antialiased`}>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
