import Image from "next/image"

export default function SkillCard(props : {
    image: string,
    width: number,
    height: number
}) {
    return (
        <>
            <div className="m-5 flex items-center justify-center rounded overflow-hidden">
                <div>
                    <Image src={props.image} width={props.width} height={props.height} alt="Sunset in the mountains" />
                </div>
            </div>
        </>
    )
}