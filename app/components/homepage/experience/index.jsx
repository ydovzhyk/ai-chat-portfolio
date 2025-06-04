// @flow strict
'use client';

import dynamic from 'next/dynamic';
import { experiences } from '../../../../utils/data/experience';
import Image from 'next/image';
import { BsPersonWorkspace } from 'react-icons/bs';
import experience from '../../../assets/lottie/code.json';
const AnimationLottie = dynamic(() => import('../../helper/animation-lottie'), {
  ssr: false,
});
import GlowCard from '../../helper/glow-card';
import { toast } from 'react-toastify';

function Experience() {
  const handleProjectClick = (e, projectName, notReadyList) => {
    const isDesktop = window.innerWidth >= 1024
    const isNotReady = notReadyList.includes(projectName)

    if (isNotReady && !isDesktop) {
      e.preventDefault()
      toast.info(
        'This project is only available on desktop devices at the moment.'
      )
    }
  };

  return (
    <section
      id="experience"
      className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]"
    >
      <Image
        src="/section.svg"
        alt="Hero"
        width={1572}
        height={795}
        className="absolute top-0 -z-10"
      />
      <div className="flex justify-center my-5 lg:py-8">
        <div className="flex  items-center">
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
          <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md">
            Experiences
          </span>
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="flex justify-center items-center">
          <AnimationLottie animationPath={experience} />
        </div>

        <div className="flex flex-col gap-5">
          {experiences.map((experience) => (
            <GlowCard
              key={experience.id}
              identifier={`experience-${experience.id}`}
            >
              <div
                className="p-2 relative bg-no-repeat bg-[length:100%_100%] bg-bottom"
                style={{ backgroundImage: "url('/blur-23.svg')" }}
              >
                {/* Duration */}
                <div className="flex justify-center mb-2">
                  <p className="text-xs sm:text-sm text-[#16f2b3]">
                    {experience.duration}
                  </p>
                </div>

                {/* Title and Company */}
                <div className="flex items-center gap-x-4 px-2 py-1">
                  <div className="text-violet-500 transition-all duration-300 hover:scale-125">
                    <BsPersonWorkspace size={30} />
                  </div>
                  <div>
                    <p className="text-sm sm:text-lg mb-1 font-medium uppercase">
                      {experience.title}
                    </p>
                    <p className="text-sm sm:text-base text-gray-300">
                      {experience.company}
                    </p>
                  </div>
                </div>

                {/* Projects */}
                <div className="px-2 py-2">
                  <div className="flex flex-wrap text-sm sm:text-base items-center">
                    <span className="text-white font-semibold mr-2">
                      {experience.projects.length > 1
                        ? 'Projects:'
                        : 'Project:'}
                    </span>
                    {experience.projects.map((project, index) => {
                      return (
                        <span key={index} className="flex items-center">
                          <a
                            href={experience.links[index]}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) =>
                              handleProjectClick(
                                e,
                                project,
                                experience.notReady
                              )
                            }
                            className="text-cyan-400 hover:underline hover:text-cyan-300 transition-all duration-300"
                          >
                            {project}
                          </a>
                          {index !== experience.projects.length - 1 && (
                            <span>, &nbsp;</span>
                          )}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience;
