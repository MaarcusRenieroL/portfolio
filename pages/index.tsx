import Head from 'next/head'
import Script from 'next/script'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'

import { motion, useScroll, useSpring } from 'framer-motion'

import Navbar from '@/components/Navbar'
import HomeSection from '@/components/HomeSection'
import AboutSection from '@/components/AboutSection'
import SkillSection from '@/components/SkillSection'
import PortfolioSection from '@/components/PortfolioSection'
import ContactSection from '@/components/FooterSection'
import EducationSection from '@/components/EducationSection'

const inter = Inter({ subsets: ['latin'] })


export default function Home() {


	return (
		<>
			<Head>
				<title>Portfolio</title>
			</Head>
			<Script src="https://unpkg.com/@themesberg/flowbite@1.2.0/dist/flowbite.bundle.js"></Script>
			<div>
				<Navbar />
				<HomeSection />
				<section id='about'>
					<AboutSection />
				</section>
				<section id='skills'>
					<SkillSection />
				</section>
				<section id='education'>
					<EducationSection />
				</section>
				<section id='portfolio'>
					<PortfolioSection />
				</section>
				<section id='contact'>
					<ContactSection />
				</section> 
			</div>
		</>
	)
}
