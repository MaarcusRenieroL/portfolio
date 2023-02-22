import React from "react";

import Image from "next/image";
import Link from "next/link";

import { Cursor, useTypewriter } from "react-simple-typewriter";

import { motion } from "framer-motion";

export default function HomeSection() {

    const [text, count] = useTypewriter({
        words: [
            "Student",
            "Full Stack Developer",
            "Web Developer",
            "Data Analyst",
            "Software Developer"
        ],
        loop: 0,
        delaySpeed: 2000,
    });

    return (
        <>
            <motion.div className="h-fit lg:px-32 md:mt-10 sm:mt-3 sm:p-10 xs:p-5 md:text-left xs:text-center"
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{once:true}}
            >
                <div className="flex items-start justify-start pl-5 mb-10">
                    <h1 className="md:text-4xl sm:text-xl font-black opacity-50">
                        <span className="text-purple-500">
                            00.
                        </span>
                        &lt;bonjour&gt;
                    </h1>
                </div>
                <div className="md:grid md:grid-cols-2 sm:grid-cols-1">
                    <div className="p-5 flex items-center justify-center">
                        <Image src="/me-circle.png" width={350} height={350} alt='my-profile-picture' />
                    </div>
                    <div className="p-5">
                        <h1 className="md:text-4xl font-bold sm:text-2xl">
                            Hi I am <span className="text-purple-500">Maarcus</span>
                            <br />
                            <br />
                            A <span className="text-purple-500">{text}</span>
                        </h1>
                        <div className="flex lg:items-start lg:justify-start w-full xs:items-center xs:justify-center">
                            <motion.button className="mt-10 p-4 bg-purple-500 hover:bg-purple-800 text-white rounded-lg" 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}>
                                <Link href={"mailto:maarcusreniero.l@gmail.com"}>
                                    Contact Me!!
                                </Link>
                            </motion.button>
                        </div>
                    </div>

                </div>



                <div className="flex items-end justify-end mt-14 pr-5">
                    <h1 className="md:text-4xl xs:text-lg font-black opacity-50">
                        &lt;/bonjour&gt;
                    </h1>
                </div>
            </motion.div>
        </>
    );
}

