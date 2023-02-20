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
                    <div className="p-5 h-96 flex items-center justify-center">
                        <Swiper
                            spaceBetween={30}
                            centeredSlides={true}
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                            pagination={{
                                clickable: true,
                            }}
                            navigation={true}
                            modules={[Autoplay, Pagination, Navigation]}
                            className="mySwiper"
                        >
                            <SwiperSlide>
                                <PortfolioCard />
                            </SwiperSlide>
                            <SwiperSlide>
                                <PortfolioCard />
                            </SwiperSlide>
                            <SwiperSlide>
                                <PortfolioCard />
                            </SwiperSlide>
                            <SwiperSlide>
                                <PortfolioCard />
                            </SwiperSlide>
                        </Swiper>
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