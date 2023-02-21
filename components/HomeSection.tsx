import Image from "next/image";

export default function HomeSection() {
    return (
        <>
            <div className="h-fit lg:px-32 md:mt-10 sm:mt-3 sm:p-10 xs:p-5">
                <div className="flex items-start justify-start pl-5">
                    <h1 className="md:text-4xl sm:text-xl font-black opacity-50">
                        <span className="text-purple-500">
                            00.
                        </span>
                        &lt;ohayo&gt;
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
                            I am a <span className="text-purple-500">Full Stack Developer</span>
                        </h1>
                        <p className="lg:text-2xl md:text-xl sm:text-lg font-medium md:mt-20 sm:mt-10 xs:mt-5 p-3">
                            I am a Full Stack Developer with a passion for building
                            <br />
                            and designing websites and applications.

                        </p>
                        <div className="flex lg:items-start lg:justify-start w-full xs:items-center xs:justify-center">
                        <button className="mt-10 p-4 bg-purple-500 text-white rounded-lg">
                            Contact Me!!
                        </button>
                        </div>
                    </div>
                    
                </div>



                <div className="flex items-end justify-end mt-14 pr-5">
                    <h1 className="md:text-4xl xs:text-lg font-black opacity-50">
                        &lt;/ohayo&gt;
                    </h1>
                </div>
            </div>
        </>
    );
}