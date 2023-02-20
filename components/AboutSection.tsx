export default function AboutSection() {
    return (
        <>
            <div className="h-screen p-12">
                <div className="flex items-center justify-start">
                    <h1 className="text-4xl font-black opacity-50">
                        <span className="text-purple-500">
                            01.
                        </span>
                        &lt;a little about me&gt;
                    </h1>
                </div>
                <div className="w-3/4 pl-20 mt-12">
                    <p className="text-xl">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Hello! My name is Maarcus Reniero L, and I am a student specializing in the field web development. From a young age, I have been fascinated by the power of technology and its ability to connect people from all over the world. As I grew older, I realized that web development was the perfect field for me to channel this passion and make an impact.
                    </p>
                    <br />
                    <br />
                    <p className="text-xl">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Currently, I am pursuing my Bachelors of Technology in Computer Science with Business System at Rajalakshmi Engineering College and have been honing my skills in web development through various courses and projects. I have experience with C, C++, Python, Java, HTML, CSS, JavaScript, React JS, Node JS, Express JS, MongoDB, Oracle SQL, Next JS, Typescript and Tailwind CSS, and I'm always eager to learn new techniques and tools to expand my skillset.
                    </p>
                    <br />
                    <br />
                    <p className="text-xl">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        When I'm not coding, I love to watch anime ,listen to music, play badminton and also keyboard and guitar. I find that these hobbies not only help me unwind, but they also inspire me to approach things with fresh perspectives and creativity.
                    </p>
                    <br />
                    <br />
                    <p className="text-xl">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        In the future, I hope to use my skills in web development to make a positive impact on the world. I believe that technology has the power to solve some of the world's most pressing problems, and I want to be a part of that change. Thank you for taking the time to learn a little bit more about me!
                    </p>
                    <br />
                    <br />

                    <button className="mt-10 p-4 bg-purple-500 text-white rounded-lg">
                        Dwonload Resume
                    </button>
                </div>

                <div className="flex items-end justify-end mt-14">
                    <h1 className="text-4xl font-black opacity-50">
                        &lt;/a little about me&gt;
                    </h1>
                </div>
            </div>
        </>
    );
}