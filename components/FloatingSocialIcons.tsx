import Link from "next/link"
import Image from "next/image"

export default function FloatingSocialIcons() {
    return (
        <>
            <div className="fixed left-10 top-1/3 z-96 px-5 py-3 bg-transparent flex flex-col space-y-5">

                <Link href="#">
                    <Image src={"/github.png"} width={40} height={40} alt='github-logo'/>
                </Link>


                <Link href="#" title="Share on WhatsApp">
                <Image src={"/whatsapp.png"} width={40} height={40} alt='github-logo'/>
                </Link>


                <Link href="#" title="Share on Twitter">
                <Image src={"/linkedin.png"} width={40} height={40} alt='github-logo' className="opacity-50"/>
                </Link>


                <Link href="#" title="Share on LinkedIn">
                <Image src={"/mail.png"} width={40} height={40} alt='github-logo'/>
                </Link>
                <div className="flex items-center justify-center rotate-180">
                    <hr className="h-64 w-0.5 bg-purple-500 rounded-lg" />
                </div>
            </div>
        </>
    )
}