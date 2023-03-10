import Link from "next/link";
import React from "react";

import { motion } from "framer-motion";


export default function Navbar() {

    const [navbarOpen, setNavbarOpen] = React.useState(false);

    return (
        <>
            <nav className="w-full">
                <div className="justify-between px-4 mx-auto lg:max-w-screen md:items-center md:flex md:px-8">
                    <div>
                        <div className="flex items-center justify-between h-16 py-3 md:py-5 md:block">
                            <a href="#">
                                <h2 className="text-2xl">&lt;Maarcus Reniero L /&gt;</h2>
                            </a>
                            <div className="md:hidden">
                                <button
                                    className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                                    onClick={() => setNavbarOpen(!navbarOpen)}
                                >
                                    {navbarOpen ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 "
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 "
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div
                            className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${navbarOpen ? 'block' : 'hidden'
                                }`}
                        >
                            <ul className="items-center justify-center text-center space-y-8 md:flex md:space-x-6 md:space-y-0">
                                <motion.li
                                    className=""
                                    initial={{
                                        x: -500,
                                        opacity: 0
                                    }}
                                    whileInView={{
                                        x: 0,
                                        opacity: 1
                                    }}
                                    transition={{
                                        duration: 2
                                    }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={"#about"}>
                                        <span className="text-purple-500 pr-2">
                                            01.
                                        </span>
                                        &lt;about&gt;
                                    </Link>
                                </motion.li>
                                <motion.li
                                    className=""
                                    initial={{
                                        x: -500,
                                        opacity: 0
                                    }}
                                    whileInView={{
                                        x: 0,
                                        opacity: 1
                                    }}
                                    transition={{
                                        duration: 2
                                    }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={"#skills"}>
                                        <span className="text-purple-500 pr-2">
                                            02.
                                        </span>
                                        &lt;skills&gt;
                                    </Link>
                                </motion.li>
                                <motion.li
                                    className=""
                                    initial={{
                                        x: -500,
                                        opacity: 0
                                    }}
                                    whileInView={{
                                        x: 0,
                                        opacity: 1
                                    }}
                                    transition={{
                                        duration: 2
                                    }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={"#education"}>
                                        <span className="text-purple-500 pr-2">
                                            03.
                                        </span>
                                        &lt;education&gt;
                                    </Link>
                                </motion.li>
                                <motion.li
                                    className=""
                                    initial={{
                                        x: -500,
                                        opacity: 0
                                    }}
                                    whileInView={{
                                        x: 0,
                                        opacity: 1
                                    }}
                                    transition={{
                                        duration: 2
                                    }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={"#portfolio"}>
                                        <span className="text-purple-500 pr-2">
                                            04.
                                        </span>
                                        &lt;portfolio&gt;
                                    </Link>
                                </motion.li>
                                <motion.li
                                    className=""
                                    initial={{
                                        x: -500,
                                        opacity: 0
                                    }}
                                    whileInView={{
                                        x: 0,
                                        opacity: 1
                                    }}
                                    transition={{
                                        duration: 2
                                    }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={"#contact"}>
                                        <span className="text-purple-500 pr-2">
                                            05.
                                        </span>
                                        &lt;contact&gt;
                                    </Link>
                                </motion.li>
                            </ul>
                        </div>
                    </div>
                </div>

            </nav>
        </>
    )
}