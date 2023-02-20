import Image from "next/image";

export default function HomeSection() {
    return (
        <>
            <div className="h-screen px-24">
                <div className="flex items-center justify-start">
                    <h1 className="text-4xl font-black opacity-50">
                        <span className="text-purple-500">
                            00.
                        </span>
                        &lt;Welcome&gt;
                    </h1>
                </div>
                <div className="flex items-center justify-center px-10">
                    <div>
                        <h1 className="text-6xl font-bold">
                            Hi I am <span className="text-purple-500">Maarcus</span>
                            <br />
                            <br />
                            I am a <span className="text-purple-500">Full Stack Developer</span>
                        </h1>
                        <p className="text-2xl font-medium mt-20">
                            I am a Full Stack Developer with a passion for building
                            <br />
                            and designing websites and applications.

                        </p>
                        <button className="mt-10 p-4 bg-purple-500 text-white rounded-lg">
                            Contact Me!!
                        </button>
                    </div>
                    <div className="p-5 flex items-center justify-center">
                        <Image src="/me.jpeg" width={350} height={350} alt='my-profile-picture' className="rounded-lg" />
                    </div>
                </div>



                <div className="flex items-end justify-end mt-14">
                    <h1 className="text-4xl font-black opacity-50">
                        <span className="text-purple-500">
                            00.
                        </span>
                        &lt;/Welcome&gt;
                    </h1>
                </div>
            </div>
        </>
    );
}