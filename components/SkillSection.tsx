import SkillCard from "./SkillCard";

export default function SkillSection() {
    return (
        <>
            <div className="h-fit lg:px-32 md:mt-10 sm:mt-3 sm:p-10 xs:p-5">
                <div className="flex items-center justify-start pl-5">
                    <h1 className="md:text-4xl xs:text-xl font-black opacity-50">
                        <span className="text-purple-500">
                            02.
                        </span>
                        &lt;skills&gt;
                    </h1>
                </div>
                <div className="flex items-center justify-center">
                    <div className="grid lg:grid-cols-6 md:grid-cols-4 xs:grid-cols-2 gap-3">
                        <SkillCard image="/adobe-illustrator-logo.png" width={100} height={100} />
                        <SkillCard image="/arduino-logo.png" width={100} height={100} />
                        <SkillCard image="/bootstrap-logo.png" width={100} height={100} />
                        <SkillCard image="/c-logo.png" width={100} height={100} />
                        <SkillCard image="/cplusplus-logo.png" width={100} height={100} />
                        <SkillCard image="/css-logo.png" width={100} height={100} />
                        <SkillCard image="/express-logo.png" width={100} height={100} />
                        <SkillCard image="/figma-logo.png" width={100} height={100} />
                        <SkillCard image="/git-logo.png" width={100} height={100} />
                        <SkillCard image="/github-logo.png" width={100} height={100} />
                        <SkillCard image="/html-logo.png" width={100} height={100} />
                        <SkillCard image="/java-logo.png" width={100} height={100} />
                        <SkillCard image="/js-logo.png" width={100} height={100} />
                        <SkillCard image="/kotlin-logo.png" width={100} height={100} />
                        <SkillCard image="/linux-logo.png" width={100} height={100} />
                        <SkillCard image="/mongodb-logo.png" width={100} height={100} />
                        <SkillCard image="/mysql-logo.png" width={100} height={100} />
                        <SkillCard image="/next.svg" width={100} height={100} />
                        <SkillCard image="/nodejs-logo.png" width={100} height={100} />
                        <SkillCard image="/npm-logo.png" width={100} height={100} />
                        <SkillCard image="/php-logo.png" width={100} height={100} />
                        <SkillCard image="/python-logo.png" width={100} height={100} />
                        <SkillCard image="/react-logo.png" width={100} height={100} />
                        <SkillCard image="/ts-logo.png" width={100} height={100} />
                    </div>
                </div>
                <div className="flex items-end justify-end mt-14 pr-5">
                    <h1 className="md:text-4xl xs:text-lg font-black opacity-50">
                        &lt;/skills&gt;
                    </h1>
                </div>
            </div>
        </>
    )
}