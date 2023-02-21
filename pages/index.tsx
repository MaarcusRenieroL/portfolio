import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'

import Navbar from '@/components/Navbar'
import HomeSection from '@/components/HomeSection'
import AboutSection from '@/components/AboutSection'
import PortfolioSection from '@/components/PortfolioSection'
import ContactSection from '@/components/ContactSection'
import FloatingSocialIcons from '@/components/FloatingSocialIcons'
import FloatingMail from '@/components/FloatingMail'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
	return (
		<>
			<Head>
				<title>Portfolio</title>
			</Head>
			<main>
				<Navbar />
				<FloatingSocialIcons />
				<FloatingMail />
				<HomeSection />
				<section id='about'>
					<AboutSection />
				</section>
				<section id='portfolio'>
					<PortfolioSection />
				</section>
				<section id='contact'>
					<ContactSection />
				</section>
			</main>
		</>
	)
}
