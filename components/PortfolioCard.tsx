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
            <div className="max-w-2xl px-8 py-4 rounded-lg shadow-md">
                <div className="flex items-center justify-end">
                    <span className="text-sm font-light">{props.date}</span>
                </div>

                <div className="mt-2">
                    <a href="#" className="text-xl font-bold hover:underline"  role="link">
                        {props.title}
                    </a>
                    <p className="mt-2">
                        {props.content}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="hidden object-cover w-10 h-10 mx-4 rounded-full sm:block" src="/github.png" alt="avatar" />
                            <Link className="font-bold text-gray-700 cursor-pointer" href={props.url} role="link"></Link>
                    </div>
                </div>
            </div>
        </>
    )
}