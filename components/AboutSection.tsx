import Link from "next/link";

import { motion } from "framer-motion";

export default function AboutSection() {

    return (
        <>
            <motion.div 
                className="h-fit lg:px-32 md:mt-10 sm:mt-3 sm:p-10 xs:p-5 md:text-left xs:text-center"
                initial={{ x: 200, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{once:true}}
            >
                <div className="flex items-center justify-start pl-5">
                    <h1 className="md:text-4xl xs:text-xl font-black opacity-50">
                        <span className="text-purple-500">
                            01.
                        </span>
                        &lt;a little about me&gt;
                    </h1>
                </div>
                <div className="sm:w-full md:pl-20 lg:mt-12 sm:mt-6 xs:mt-3 xs:p-4 md:text-xl sm:text-sm">
                    <p>
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Hello! This is <span className="text-purple-500">
                        Maarcus Reniero L
                        </span>
                        , a student specializing in the field web development. From a young age, I have been fascinated by the power of technology and its ability to connect people from all over the world. As I grew older, I realized that web development was the perfect field for me to channel this passion and make an impact.
                    </p>
                    <br />
                    <br />
                    <p>
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Currently, I am pursuing my <span className="text-purple-500">Bachelors of Technology in Computer Science with Business Systems </span>at <span className="text-purple-500">Rajalakshmi Engineering College</span> and have been honing my skills in web development through various courses and projects. I'm always eager to learn new techniques and tools to expand my skillset.
                    </p>
                    <br />
                    <br />
                    <p>
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        When I'm not coding, I love to watch anime ,listen to music, play badminton and also keyboard and guitar. I find that these hobbies not only help me unwind, but they help me stay more healthier and inspire me to approach things with fresh perspectives and creativity.
                    </p>
                    <br />
                    <br />
                </div>

                <div className="flex items-end justify-end mt-14 pr-5">
                    <h1 className="md:text-4xl xs:text-lg font-black opacity-50">
                        &lt;/a little about me&gt;
                    </h1>
                </div>
            </motion.div>
        </>
    );
}