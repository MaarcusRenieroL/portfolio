import Image from "next/image";
import PortfolioCard from "./PortfolioCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function PortfolioSection() {
    return (
        <>
            <div className="h-screen p-12">
                <div className="flex items-center justify-start">
                    <h1 className="text-4xl font-black opacity-50">
                        <span className="text-purple-500">
                            02.
                        </span>
                        &lt;portfolio&gt;
                    </h1>
                </div>
                <div className="px-24 mt-12">
                    <p className="text-xl">
                        Here are some of my projects that I have worked on with my college friends and also some of my personal projects.
                    </p>
                    <div className="grid grid-cols-2">
                    <PortfolioCard title="Cryptopass" content="A simple password manager application which has basic features like adding a password, storing it in the application in an encrypted  form, retrieving a password and deleting a password" tag1="Python" tag2="MySQL" tag3="Tkinter" image="/cryptopass.png" width={1500} height={1500}/>
                    <PortfolioCard title="HealthX" content="Give a unique id for every patient and stores the clinical details of every patient and hospital tests done automatically and give access for patients also" tag1="Next JS" tag2="Firebase" tag3="Tailwind CSS" image="/healthX.png" width={1500} height={1500}/>
                    <PortfolioCard title="Secure Track" content="Fleet Management System to montior the bus routes and to let the students and parents know where their transport is" tag1="Next JS" tag2="Typescript" tag3="Tailwind CSS" image="/secure-track.png" width={1500} height={1500}/>
                    </div>
                </div>
                <div className="flex items-end justify-end">
                    <h1 className="text-4xl font-black opacity-50">
                        &lt;/portfolio&gt;
                    </h1>
                </div>
            </div>
        </>
    );
}