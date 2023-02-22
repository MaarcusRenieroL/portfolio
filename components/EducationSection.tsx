import React, { useState } from "react";

import { motion } from "framer-motion";

export default function EducationSection() {

	const [selected, setSelected] = useState(null);

	const content = [
		{
			id: 1,
			title: "B.TECH Computer Science with Business Systems",
			time: "Nov 2020 - Present",
			place: "Rajalakshmi Engineering College",
			score: "Current CGPA - 7.65"
		},
		{
			id: 2,
			title: "Higher Secondary Education",
			time: "2019 - 2020",
			place: "St. John's English School and Junior College",
			score: "Percentile - 60.3%"
		},
		{
			id: 3,
			title: "Secondary Education",
			time: "2017 - 2018",
			place: "St. John's English School and Junior College",
			score: "Percentile - 70.4%"
		}
	]

	return (
		<>
			<motion.div
				className="max-w-screen lg:px-32 md:mt-10 sm:mt-3 sm:p-10 xs:p-5"
				initial={{ x: -100, opacity: 0 }}
				whileInView={{ x: 0, opacity: 1 }}
				transition={{ duration: 1 }}
				viewport={{ once: true }}
			>
				<div className="flex items-center justify-start pl-5">
					<h1 className="md:text-4xl xs:text-xl font-black opacity-50">
						<span className="text-purple-500">
							03.
						</span>
						&lt;education&gt;
					</h1>
				</div>
				<div
					className="flex flex-col md:grid grid-cols-9 mx-auto p-2 max-w-7xl my-10"
				>
					<div
						className="flex flex-row-reverse md:contents"

					>
						<motion.div
							className="col-start-1 col-end-5 p-4 rounded-xl my-4 ml-auto shadow-md"
							initial={{ x: 200, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{ duration: 1 }}
							viewport={{ once: true }}
						>
							<h3 className="font-semibold text-lg mb-1">B.TECH Computer Science with Business Systems Nov 2020 - Present</h3>
							<p className="">
								Rajalakshmi Engineering College
								<br />
								Current CGPA - 7.65
							</p>
						</motion.div>
						<div className="col-start-5 col-end-6 md:mx-auto relative mr-10">
							<div className="h-full w-6 flex items-center justify-center">
								<div className="h-full w-1 bg-purple-800 pointer-events-none"></div>
							</div>
							<div
								className="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-purple-500 shadow"
							></div>
						</div>
					</div>
					<div className="flex md:contents">
						<div className="col-start-5 col-end-6 mr-10 md:mx-auto relative">
							<div className="h-full w-6 flex items-center justify-center">
								<div className="h-full w-1 bg-purple-800 pointer-events-none"></div>
							</div>
							<div
								className="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-purple-500 shadow"
							></div>
						</div>
						<motion.div
							className="col-start-6 col-end-10 p-4 rounded-xl my-4 mr-auto shadow-md"
							initial={{ x: -200, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{ duration: 1 }}
							viewport={{ once: true }}
						>
							<h3 className="font-semibold text-lg mb-1">
								HSC
								<br />
							</h3>
							<p className="">
								{/* eslint-disable-next-line react/no-unescaped-entities */}
								St. John's English School and Junior College
								Percentile - 60.3%
							</p>
						</motion.div>
					</div>
					<div className="flex flex-row-reverse md:contents">

						<motion.div
							className="col-start-1 col-end-5 p-4 rounded-xl my-4 ml-auto shadow-md"
							initial={{ x: 200, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{ duration: 1 }}
							viewport={{ once: true }}
						>
							<h3 className="font-semibold text-lg mb-1">
								SSLC
								<br />
								2017-2018
							</h3>
							<p className="">
								{/* eslint-disable-next-line react/no-unescaped-entities */}
								St. John's English School and Junior College
								Percentile - 70.4%
							</p>
						</motion.div>
						<div className="col-start-5 col-end-6 md:mx-auto relative mr-10">
							<div className="h-full w-6 flex items-center justify-center">
								<div className="h-full w-1 bg-purple-800 pointer-events-none"></div>
							</div>
							<div
								className="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-purple-500 shadow"
							></div>
						</div>
					</div>
				</div>
				<div className="flex items-end justify-end mt-14 pr-5">
					<h1 className="md:text-4xl xs:text-lg font-black opacity-50">
						&lt;/education&gt;
					</h1>
				</div>
			</motion.div>
		</>
	)
}