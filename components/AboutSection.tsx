export default function AboutSection() {
    return (
        <>
            <div className="h-fit lg:px-32 md:mt-10 sm:mt-3 sm:p-10 xs:p-5">
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
                        Hello! My name is Maarcus Reniero L, and I am a student specializing in the field web development. From a young age, I have been fascinated by the power of technology and its ability to connect people from all over the world. As I grew older, I realized that web development was the perfect field for me to channel this passion and make an impact.
                    </p>
                    <br />
                    <br />
                    <p>
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Currently, I am pursuing my Bachelors of Technology in Computer Science with Business System at Rajalakshmi Engineering College and have been honing my skills in web development through various courses and projects. I'm always eager to learn new techniques and tools to expand my skillset.
                    </p>
                    <br />
                    <br />
                    <p>
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        When I'm not coding, I love to watch anime ,listen to music, play badminton and also keyboard and guitar. I find that these hobbies not only help me unwind, but they help me stay more healthier and inspire me to approach things with fresh perspectives and creativity.
                    </p>
                    <br />
                    <br />

                    <div className="flex lg:items-start lg:justify-start w-full xs:items-center xs:justify-center">
                        <button className="p-4 bg-purple-500 text-white rounded-lg">
                            Download Resume
                        </button>
                        </div>
                </div>

                <div className="flex items-end justify-end mt-14 pr-5">
                    <h1 className="md:text-4xl xs:text-lg font-black opacity-50">
                        &lt;/a little about me&gt;
                    </h1>
                </div>
            </div>
        </>
    );
}