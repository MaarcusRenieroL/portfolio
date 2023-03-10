import Image from "next/image"
import Link from "next/link"

export default function PortfolioCard(props: {
    date: string,
    title: string,
    content: string,
    image: string,
    url: string
}) {
    return (
        <>
            <div className="max-w-2xl h-fit px-8 py-4 rounded-lg shadow-md">
                <div className="flex items-center justify-end">
                    <span className="text-sm font-light">{props.date}</span>
                </div>

                <div className="mt-2">
                    <Link href={props.url} className="text-xl font-bold hover:underline" target={"_blank"} role="link">
                        {props.title}
                    </Link>
                    <p className="mt-2">
                        {props.content}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                        
                            <Link className="font-bold text-gray-700 cursor-pointer" href={props.url} target={"_blank"} role="link">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="hidden object-cover w-10 h-10 mx-4 rounded-full" src="/github.png" alt="avatar" />
                            </Link>
                    </div>
                </div>
            </div>
        </>
    )
}