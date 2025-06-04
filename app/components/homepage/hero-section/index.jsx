// @flow strict
'use client';

/* eslint-disable react/no-unescaped-entities */
import React, { useCallback } from 'react';
import { personalData } from '../../../../utils/data/personal-data';
import Image from "next/image";
import Link from "next/link";
import { BiLogoLinkedin } from 'react-icons/bi';
import { FaFacebook } from 'react-icons/fa';
import { IoLogoGithub, IoMdCall } from 'react-icons/io';
import { MdAlternateEmail } from 'react-icons/md';

function HeroSection() {

  const handleScroll = useCallback((id) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      })
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-between lg:pb-10 lg:pt-0"
    >
      <Image
        src="/hero.svg"
        alt="Hero"
        width={1572}
        height={865}
        className="absolute -top-[168px] -z-10"
      />
      <div className="grid grid-cols-1 items-start lg:grid-cols-2 lg:gap-12 gap-y-8">
        <div className="order-2 lg:order-1 flex flex-col items-start justify-center p-2 pb-20 md:pb-10 lg:pt-10">
          <h1 className="text-3xl font-bold leading-10 text-white md:font-extrabold lg:text-[2.6rem] lg:leading-[3.5rem]">
            {`Hello, `} <br />
            {'I\u2019m - '}
            <span className=" text-pink-500">{personalData.name}</span>
            <br />
            <span className=" text-[#16f2b3]">{personalData.designation}</span>
            <br />
            {` who loves building useful things.`}
          </h1>
          <div className="mt-6 mb-6 lg:mt-10 lg:mb-10 flex items-center gap-5 lg:gap-10">
            <Link target="_blank" href={personalData.github}>
              <IoLogoGithub
                className="bg-[#8b98a5] p-3 rounded-full hover:bg-[#16f2b3] hover:scale-110 transition-all duration-300 text-gray-800 cursor-pointer"
                size={48}
              />
            </Link>
            <Link target="_blank" href={personalData.linkedIn}>
              <BiLogoLinkedin
                className="bg-[#8b98a5] p-3 rounded-full hover:bg-[#16f2b3] hover:scale-110 transition-all duration-300 text-gray-800 cursor-pointer"
                size={48}
              />
            </Link>
            <Link target="_blank" href={personalData.facebook}>
              <FaFacebook
                className="bg-[#8b98a5] p-3 rounded-full hover:bg-[#16f2b3] hover:scale-110 transition-all duration-300 text-gray-800 cursor-pointer"
                size={48}
              />
            </Link>
            <Link target="_blank" href={`mailto:${personalData.email}`}>
              <MdAlternateEmail
                className="bg-[#8b98a5] p-3 rounded-full hover:bg-[#16f2b3] hover:scale-110 transition-all duration-300 text-gray-800 cursor-pointer"
                size={48}
              />
            </Link>
            <Link target="_blank" href={`tel:${personalData.phone}`}>
              <IoMdCall
                className="bg-[#8b98a5] p-3 rounded-full hover:bg-[#16f2b3] hover:scale-110 transition-all duration-300 text-gray-800 cursor-pointer"
                size={48}
              />
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <div
              onClick={() => handleScroll('contact')}
              className="cursor-pointer group bg-gradient-to-r from-violet-600 to-pink-500 p-[1px] rounded-full transition-all duration-300 hover:from-pink-500 hover:to-violet-600"
            >
              <button className="flex items-center gap-1 hover:gap-3 px-3 md:px-8 py-3 md:py-4 rounded-full border-none text-xs md:text-sm font-medium uppercase tracking-wider transition-all duration-200 ease-out md:font-semibold bg-[#0d1224] text-white group-hover:bg-transparent group-hover:text-white w-full">
                <span>Contact me</span>
              </button>
            </div>
            <Link
              href={personalData.resume}
              target="_blank"
              className="group bg-gradient-to-r from-violet-600 to-pink-500 p-[1px] rounded-full transition-all duration-300 hover:from-pink-500 hover:to-violet-600"
            >
              <div className="flex items-center gap-1 hover:gap-3 px-3 md:px-8 py-3 md:py-4 rounded-full border-none text-xs md:text-sm font-medium uppercase tracking-wider transition-all duration-200 ease-out md:font-semibold bg-[#0d1224] text-white group-hover:bg-transparent group-hover:text-white w-full text-center">
                <span>Get Resume</span>
              </div>
            </Link>
          </div>
        </div>
        <div className="order-1 lg:order-2 from-[#0d1224] border-[#1b2c68a0] relative rounded-lg border bg-gradient-to-r to-[#0a0d37]">
          <div className="flex flex-row">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600"></div>
            <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
          </div>
          <div className="px-4 lg:px-8 py-5">
            <div className="flex flex-row space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-orange-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-200"></div>
            </div>
          </div>
          <div className="overflow-hidden border-t-[2px] border-indigo-900 px-4 lg:px-6 py-4 lg:py-6">
            <code className="font-mono text-sm md:text-sm lg:text-base">
              <div className="blink">
                <span className="mr-2 text-pink-500">const</span>
                <span className="mr-2 text-white">coder</span>
                <span className="mr-2 text-pink-500">=</span>
                <span className="text-gray-400">{'{'}</span>
              </div>

              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-white">name:</span>
                <span className="text-gray-400">&#39;</span>
                <span className="text-orange-200">Yuriy Dovzhyk</span>
                <span className="text-gray-400">&#39;,</span>
              </div>

              <div className="ml-4 lg:ml-8 mr-2">
                <span className="text-white">skills:</span>
                <span className="text-gray-400">{' ['}</span>
                {[
                  'HTML5',
                  'CSS3',
                  'SASS',
                  'Tailwind CSS',
                  'JavaScript',
                  'TypeScript',
                  'React',
                  'Redux Toolkit',
                  'Next.js',
                  'Vue.js',
                  'Node.js',
                  'Express.js',
                  'MongoDB',
                  'Firebase',
                  'REST API',
                  'OpenAI API',
                ].map((skill, i, arr) => (
                  <React.Fragment key={i}>
                    <span className="text-orange-200">&#39;{skill}&#39;</span>
                    {i < arr.length - 1 && (
                      <span className="text-gray-400">, </span>
                    )}
                  </React.Fragment>
                ))}
                <span className="text-gray-400">{']'}</span>
                <span className="text-gray-400">,</span>
              </div>

              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-white">
                  hardWorker:
                </span>
                <span className="text-orange-400">true</span>
                <span className="text-gray-400">,</span>
              </div>

              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-white">
                  quickLearner:
                </span>
                <span className="text-orange-400">true</span>
                <span className="text-gray-400">,</span>
              </div>

              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-white">
                  problemSolver:
                </span>
                <span className="text-orange-400">true</span>
                <span className="text-gray-400">,</span>
              </div>

              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-green-400">
                  hireable:
                </span>
                <span className="text-orange-400">function</span>
                <span className="text-gray-400">{`() {`}</span>
              </div>

              <div>
                <span className="ml-8 lg:ml-16 mr-2 text-orange-400">
                  return
                </span>
                <span className="text-gray-400">{`(`}</span>
              </div>

              <div>
                <span className="ml-12 lg:ml-24 text-cyan-400">this.</span>
                <span className="mr-2 text-white">hardWorker</span>
                <span className="text-orange-200">&&</span>
              </div>

              <div>
                <span className="ml-12 lg:ml-24 text-cyan-400">this.</span>
                <span className="mr-2 text-white">problemSolver</span>
                <span className="text-orange-200">&&</span>
              </div>

              <div>
                <span className="ml-12 lg:ml-24 text-cyan-400">this.</span>
                <span className="mr-2 text-white">skills.length</span>
                <span className="mr-2 text-orange-200">&gt;=</span>
                <span className="text-orange-400">5</span>
              </div>

              <div>
                <span className="ml-8 lg:ml-16 text-gray-400">{`)`}</span>
                <span className="text-gray-400">;</span>
              </div>

              <div>
                <span className="ml-4 lg:ml-8 text-gray-400">{'}'}</span>
                <span className="text-gray-400">,</span>
              </div>

              <div>
                <span className="text-gray-400">{'};'}</span>
              </div>
            </code>
          </div>
        </div>
      </div>
    </section>
  )
};

export default HeroSection;