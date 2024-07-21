import Image from "next/image";
import { FC } from "react";
import Link from "next/link";
import {
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";

export const UserInfo: FC = () => {
  return (
    <aside className="hidden lg:block h-full mb-0 z-10 max-h-full border rounded-xl p-10 space-y-10 overflow-hidden w-full">
      <div className="flex flex-col items-center justify-center space-y-5">
        <div className="w-full flex items-center justify-center">
          <Image
            src="/me.png"
            alt="Maarcus Reniero L"
            width={200}
            height={200}
            className="object-cover rounded-full"
          />
        </div>
        <div className="w-full flex flex-col items-center justify-center space-y-2">
          <h1 className="text-xl font-bold" title="Richard hanrick">
            Maarcus Reniero L
          </h1>
          <p className="text-sm font-semibold bg-gray-200 px-2 py-1 rounded-full">
            Full Stack Developer
          </p>
        </div>
      </div>

      <hr className="w-full" />

      <ul className="space-y-4">
        <li className="flex items-center w-full gap-5">
          <div className="p-2 flex items-center justify-center border border-black rounded-md">
            <IoMailOutline fontSize={18} />
          </div>
          <div>
            <p className="uppercase text-md">Email</p>
            <Link href="mailto:maarcusreniero.l@gmail.com" className="text-sm">
              maarcusreniero.l@gmail.com
            </Link>
          </div>
        </li>

        <li className="flex items-center w-full gap-5">
          <div className="p-2 flex items-center justify-center border border-black rounded-md">
            <IoPhonePortraitOutline fontSize={18} />
          </div>
          <div>
            <p className="uppercase text-md">Phone</p>
            <Link href="tel:+917299954472" className="text-sm">
              +917299954472
            </Link>
          </div>
        </li>

        <li className="flex items-center w-full gap-5">
          <div className="p-2 flex items-center justify-center border border-black rounded-md">
            <IoLocationOutline fontSize={18} />
          </div>
          <div>
            <p className="uppercase text-md">Location</p>
            <Link href="#" className="text-sm">
              Chennai, India
            </Link>
          </div>
        </li>
      </ul>

      <hr />

      <ul className="flex items-center justify-center space-x-5">
        <li className="social-item">
          <Link
            href="https://github.com/MaarcusRenieroL"
            className="social-link"
          >
            <FaGithub fontSize={18} />
          </Link>
        </li>

        <li className="social-item">
          <Link
            href="https://www.linkedin.com/in/maarcus-reniero-l"
            className="social-link"
          >
            <FaLinkedinIn fontSize={18} />
          </Link>
        </li>
      </ul>
    </aside>
  );
};
