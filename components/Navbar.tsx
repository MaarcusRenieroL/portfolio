import Link from "next/link";

export default function Navbar() {
    return (
        <div className="flex items-center justify-end p-10 h-16 text-lg md:text-md">
            <div className="flex items-center space-x-10 list-none">
                <li className="p-2 hover:border-b-4">
                    <Link href={"#about"}>
                        <span className="text-purple-500 pr-2">
                            01.
                        </span>
                        &lt;about&gt;
                    </Link>
                </li>
                <li>
                    <Link href={"#skills"}>
                        <span className="text-purple-500 pr-2">
                            02.
                        </span>
                        &lt;skills&gt;
                    </Link>
                </li>
                <li>
                    <Link href={"#portfolio"}>
                        <span className="text-purple-500 pr-2">
                            03.
                        </span>
                        &lt;portfolio&gt;
                    </Link>
                </li>
                <li>
                    <Link href={"#contact"}>
                        <span className="text-purple-500 pr-2">
                            04.
                        </span>
                        &lt;contact&gt;
                    </Link>
                </li>
            </div>
        </div>
    )
}