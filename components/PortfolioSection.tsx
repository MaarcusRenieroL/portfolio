import { motion } from "framer-motion";

import PortfolioCard from "./PortfolioCard";

export default function PortfolioSection() {
    return (
        <>
            <motion.div
                className="h-fit lg:px-32 md:mt-10 sm:mt-3 sm:p-10 xs:p-5"
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
            >
                <div className="flex items-center justify-start pl-5">
                    <h1 className="md:text-4xl xs:text-xl font-black opacity-50">
                        <span className="text-purple-500">
                            04.
                        </span>
                        &lt;portfolio&gt;
                    </h1>
                </div>
                <div className="lg:px-24 md:px-20 xs:p-4">
                    <p className="md:text-xl sm:mt-12 sm:text-md">
                        Here are some of my projects that I have worked on with my college friends and also some of my personal projects.
                    </p>
                    <div className="lg:grid lg:grid-cols-2 md:grid-cols-1 md:p-10 gap-5 xs:p-5">
                        <PortfolioCard title="Cryptopass" content="A simple password manager application which has basic features like adding a password, storing it in the application in an encrypted  form, retrieving a password and deleting a password" image="/cryptopass.png" date="Nov 2021" url="" />
                        <PortfolioCard title="HealthX" content="Give a unique id for every patient and stores the clinical details of every patient and hospital tests done automatically and give access for patients also" image="/healthX.png" date="Nov 2022" url="https://github.com/MaarcusRenieroL/healthX" />
                        <PortfolioCard title="Secure Track" content="Fleet Management System to montior the bus routes and to let the students and parents know where their transport is" image="/secure-track.png" date="Jan 2023" url="https://github.com/MaarcusRenieroL/secure-track" />
                    </div>
                </div>
                <div className="flex items-end justify-end mt-14 pr-5">
                    <h1 className="md:text-4xl xs:text-lg font-black opacity-50">
                        &lt;/portfolio&gt;
                    </h1>
                </div>
            </motion.div>
        </>
    );
}