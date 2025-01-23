"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
function Card1({ heading, description, link, className }) {
  return (
    <div className={`flex gap-4 rounded-xl shadow-sm p-6 ${className}`}>
      {/* <div className="min-w-max">{icon}</div> */}
      <div className="space-y-2">
        <h3 className="text-[22px] font-semibold">{heading}</h3>
        <p className="leading-8 text-gray-500 font-normal">{description}</p>
        <br />
        <Link href={`${link}`}>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            {heading}
          </button>
        </Link>
      </div>
    </div>
  );
}
export default function Dashboard() {
  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <div>
          <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400"></p>
        </div>
        <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
          <span className="relative inline-block">
            {/* <svg
              viewBox="0 0 52 24"
              fill="currentColor"
              className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
            >
              <defs>
                <pattern
                  id="d5589eeb-3fca-4f01-ac3e-983224745704"
                  x="0"
                  y="0"
                  width=".135"
                  height=".30"
                >
                  <circle cx="1" cy="1" r=".7" />
                </pattern>
              </defs>
              <rect
                fill="url(#d5589eeb-3fca-4f01-ac3e-983224745704)"
                width="52"
                height="24"
              />
            </svg> */}
            <span className="relative">Sairam</span>
          </span>{" "}
          <br />
          Jamboree Tracking
        </h2>
      </div>
      <br />
      <br />
      <p className="mx-auto mb-4 text-4xl text-gray-600 sm:text-center lg:max-w-2xl lg:mb-6 md:px-16">
        Admin Controls
      </p>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2 bg-white p-3 sm:p-8">
        <Card1
          className="bg-green-50"
          heading="Admin"
          link="/gen-add"
          description="Main acess"
          // icon={<GiAbstract020 size="2.5rem" className="text-[#D566FF]" />}
        />
        <Card1
          className="bg-purple-50"
          heading="Venue List"
          link="/see-token"
          description="View the details of Venue"
          // icon={<GiAbstract024 size="2.5rem" className="text-[#DDA10C]" />}
        />
        <Card1
          className="bg-red-100"
          heading="RED/GREEN"
          link="/token-clear"
          description="Availability of venue"
          // icon={<GiAbstract024 size="2.5rem" className="text-[#DDA10C]" />}
        />
        <Card1
          className="bg-orange-100"
          heading="Summa"
          link="/print-token"
          description="Print the token for registered schools"
          // icon={<GiAbstract024 size="2.5rem" className="text-[#DDA10C]" />}
        />
      </div>
      <div className={`rounded-xl m-auto shadow-sm w-3/4 bg-gray-200 p-6`}>
        <div className="flex justify-between items-center">
          <h3 className="text-[22px] font-semibold">Reporting Form</h3>
          {/* <p className="leading-8 text-gray-500 font-normal">{description}</p> */}
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
              ▶
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
