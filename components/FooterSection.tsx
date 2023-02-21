import Image from "next/image";
import Link from "next/link";

export default function FooterSection() {
    return (
        <>
            <section className="bg-white">
                <div className="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
                    <div className="flex justify-center mt-8 space-x-6">
                        <Link href="https://www.linkedin.com/in/maarcus-reniero-l/" className="text-gray-400 hover:text-gray-500" target={"_blank"}>
                            <span className="sr-only">Linkedin</span>
                            <Image src="/linkedin.png" alt="GitHub" width={24} height={24} />
                        </Link>
                        <Link href="https://github.com/MaarcusRenieroL" className="text-gray-400 hover:text-gray-500" target={"_blank"}>
                            <span className="sr-only">Github</span>
                            <Image src="/github.png" alt="GitHub" width={24} height={24} />
                        </Link>
                        <Link href="mailto:maarcusreniero.l@gmail.com" className="text-gray-400 hover:text-gray-500" target={"_blank"}>
                            <span className="sr-only">Mail</span>
                            <Image src="/google.png" alt="GitHub" width={24} height={24} />
                        </Link>
                        <Link href="https://twitter.com/_copyninja17" className="text-gray-400 hover:text-gray-500" target={"_blank"}>
                            <span className="sr-only">Twitter</span>
                            <Image src="/twitter.png" alt="GitHub" width={24} height={24} />
                        </Link>
                        <Link href="https://wa.me/+917299954472" className="text-gray-400 hover:text-gray-500" target={"_blank"}>
                            <span className="sr-only">Whatsapp</span>
                            <Image src="/whatsapp.png" alt="GitHub" width={24} height={24} />
                        </Link>
                    </div>
                    <p className="mt-8 text-base leading-6 text-center text-gray-400">
                        © 2021 Maarcus Reniero L. All rights reserved.
                    </p>
                </div>
            </section>
        </>
    );
}