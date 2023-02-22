import { motion } from "framer-motion";

import SkillCard from "./SkillCard";

export default function SkillSection() {
    return (
        <>
            <link rel="stylesheet" href="https://unpkg.com/@themesberg/flowbite@1.2.0/dist/flowbite.min.css" />
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{once:true}}
            >
                <div className="h-5/6 lg:px-32 md:mt-10 sm:mt-3 sm:p-10 xs:p-5">
                <div className="flex items-center justify-start pl-5">
                    <h1 className="md:text-4xl xs:text-xl font-black opacity-50">
                        <span className="text-purple-500">
                            02.
                        </span>
                        &lt;skills&gt;
                    </h1>
                </div>
                <div className="window max-w-screen mx-auto flex items-center justify-center flex-col">

                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <ul className="flex flex-wrap -mb-px" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
                            <li className="mr-2" role="presentation">
                                <button className="inline-block text-gray-500 hover:text-gray-600 hover:border-gray-300 rounded-t-lg py-4 px-4 text-sm font-medium text-center border-transparent border-b-2 dark:text-gray-400 dark:hover:text-gray-300" id="languages-tab" data-tabs-target="#languages" type="button" role="tab" aria-controls="languages" aria-selected="false">Languages</button>
                            </li>
                            <li className="mr-2" role="presentation">
                                <button className="inline-block text-gray-500 hover:text-gray-600 hover:border-gray-300 rounded-t-lg py-4 px-4 text-sm font-medium text-center border-transparent border-b-2 dark:text-gray-400 dark:hover:text-gray-300 active" id="database-tab" data-tabs-target="#database" type="button" role="tab" aria-controls="database" aria-selected="true">Database</button>
                            </li>
                            <li className="mr-2" role="presentation">
                                <button className="inline-block text-gray-500 hover:text-gray-600 hover:border-gray-300 rounded-t-lg py-4 px-4 text-sm font-medium text-center border-transparent border-b-2 dark:text-gray-400 dark:hover:text-gray-300" id="web-development-tab" data-tabs-target="#web-development" type="button" role="tab" aria-controls="web-development" aria-selected="false">Web Development</button>
                            </li>
                            <li role="presentation">
                                <button className="inline-block text-gray-500 hover:text-gray-600 hover:border-gray-300 rounded-t-lg py-4 px-4 text-sm font-medium text-center border-transparent border-b-2 dark:text-gray-400 dark:hover:text-gray-300" id="tools-tab" data-tabs-target="#tools" type="button" role="tab" aria-controls="tools" aria-selected="false">Tools</button>
                            </li>
                        </ul>
                    </div>
                    <div id="myTabContent">
                        <div className="p-4 rounded-lg hidden" id="languages" role="tabpanel" aria-labelledby="languages-tab">
                            <div className="flex items-center justify-center">
                                <div className="grid lg:grid-cols-5 md:grid-cols-3 xs:grid-cols-2 gap-3">
                                    <SkillCard image="/cplusplus-logo.png" width={100} height={100} />
                                    <SkillCard image="/c-logo.png" width={100} height={100} />
                                    <SkillCard image="/java-logo.png" width={100} height={100} />
                                    <SkillCard image="/kotlin-logo.png" width={100} height={100} />
                                    <SkillCard image="/python-logo.png" width={100} height={100} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg" id="database" role="tabpanel" aria-labelledby="database-tab">
                            <div className="flex items-center justify-center">
                                <div className="grid xs:grid-cols-2 gap-3">
                                    <SkillCard image="/mongodb-logo.png" width={100} height={100} />
                                    <SkillCard image="/mysql-logo.png" width={100} height={100} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg hidden" id="web-development" role="tabpanel" aria-labelledby="web-development-tab">
                            <div className="flex items-center justify-center">
                                <div className="grid lg:grid-cols-5 md:grid-cols-3 xs:grid-cols-2 gap-3">
                                    <SkillCard image="/html-logo.png" width={100} height={100} />
                                    <SkillCard image="/css-logo.png" width={100} height={100} />
                                    <SkillCard image="/bootstrap-logo.png" width={100} height={100} />
                                    <SkillCard image="/express-logo.png" width={100} height={100} />
                                    <SkillCard image="/js-logo.png" width={100} height={100} />
                                    <SkillCard image="/next.svg" width={100} height={100} />
                                    <SkillCard image="/nodejs-logo.png" width={100} height={100} />
                                    <SkillCard image="/npm-logo.png" width={100} height={100} />
                                    <SkillCard image="/php-logo.png" width={100} height={100} />
                                    <SkillCard image="/react-logo.png" width={100} height={100} />
                                    <SkillCard image="/ts-logo.png" width={100} height={100} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg hidden" id="tools" role="tabpanel" aria-labelledby="tools-tab">
                            <div className="flex items-center justify-center">
                                <div className="grid lg:grid-cols-4 md:grid-cols-3 xs:grid-cols-2 gap-3">
                                    <SkillCard image="/arduino-logo.png" width={100} height={100} />
                                    <SkillCard image="/adobe-illustrator-logo.png" width={100} height={100} />
                                    <SkillCard image="/figma-logo.png" width={100} height={100} />
                                    <SkillCard image="/git-logo.png" width={100} height={100} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-end justify-end mt-14 pr-5">
                    <h1 className="md:text-4xl xs:text-lg font-black opacity-50">
                        &lt;/skills&gt;
                    </h1>
                </div>
            </div>
            </motion.div>
            
        </>
    )
}