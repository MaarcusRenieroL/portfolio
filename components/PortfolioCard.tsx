import Image from "next/image"

export default function PortfolioCard(props : {
    title: string,
    content: string,
    tag1: string,
    tag2: string,
    tag3: string,
    image: string,
    width: number,
    height: number
}) {
    return (
        <>
            <div className="m-5 h-96 flex items-center justify-center rounded overflow-hidden shadow-xl">
                <div>
                    <Image src={props.image} width={props.width} height={props.height} alt="Sunset in the mountains" />
                </div>
                <div>
                    <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2">{props.title}</div>
                        <p className="text-gray-700 text-base">
                            {props.content}
                        </p>
                    </div>
                    <div className="px-6 pt-4 pb-2">
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{props.tag1}</span>
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{props.tag2}</span>
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{props.tag3}</span>
                    </div>
                </div>
            </div>
        </>
    )
}