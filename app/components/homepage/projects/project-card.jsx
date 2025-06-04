// @flow strict
'use client';

import * as React from 'react';
import { toast } from 'react-toastify';

function ProjectCard({ project }) {
  return (
    <div className="from-[#0d1224] border-[#1b2c68a0] relative rounded-lg border bg-gradient-to-r to-[#0a0d37] w-full">
      <div className="flex flex-row">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600"></div>
        <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
      </div>
      <div className="px-4 lg:px-8 py-3 lg:py-5 relative">
        <div className="flex flex-row space-x-1 lg:space-x-2 absolute top-1/2 -translate-y-1/2">
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-red-400"></div>
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-orange-400"></div>
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-green-200"></div>
        </div>
        <p className="text-center ml-3 text-[#16f2b3] text-base lg:text-xl">
          <span className="block lg:hidden">{project.shotName}</span>
          <span className="hidden lg:block">{project.name}</span>
        </p>
      </div>
      <div className="overflow-hidden border-t-[2px] border-indigo-900 px-4 lg:px-8 py-4 lg:py-8 h-[550px] lg:h-[440px] flex flex-col justify-start">
        <code className="font-mono text-sm md:text-sm lg:text-base">
          <div className="blink">
            <span className="mr-2 text-pink-500">const</span>
            <span className="mr-2 text-white">project</span>
            <span className="mr-2 text-pink-500">=</span>
            <span className="text-gray-400">{'{'}</span>
          </div>
          <div>
            <span className="ml-4 lg:ml-8 mr-2 text-white">name:</span>
            <span className="text-gray-400">&#39;</span>
            <span className="text-orange-200">{project.name}</span>
            <span className="text-gray-400">&#39;,</span>
          </div>
          <div className="ml-4 lg:ml-8 mr-2">
            <span className="text-white">tools</span>:
            <span className="text-gray-400">{' ['}</span>
            {project.tools.map((tag, i) => (
              <React.Fragment key={i}>
                <span className="text-orange-200">&#39;{tag}&#39;</span>
                {project.tools.length - 1 !== i && (
                  <span className="text-gray-400">, </span>
                )}
              </React.Fragment>
            ))}
            <span className="text-gray-400">{']'}</span>
            <span className="text-gray-400">,</span>
          </div>
          <div>
            <span className="ml-4 lg:ml-8 mr-2 text-white">myRole:</span>
            <span className="text-orange-400">&#39;{project.role}&#39;</span>
            <span className="text-gray-400">,</span>
          </div>
          <div className="ml-4 lg:ml-8 mr-2">
            <span className="text-white">description:</span>
            <span className="text-cyan-400 text-xs md:text-sm lg:text-base">
              {' '}
              &#39;{project.description}&#39;
            </span>
            <span className="text-gray-400">,</span>
          </div>
          {project.frontendGitLink && (
            <div className="ml-4 lg:ml-8 mr-2">
              <span className="text-white">frontendCode</span>:&nbsp;
              <a
                href={project.frontendGitLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 no-underline hover:underline"
              >
                link
              </a>
              <span className="text-gray-400">,</span>
            </div>
          )}
          {project.backendGitLink && (
            <div className="ml-4 lg:ml-8 mr-2">
              <span className="text-white">backendCode</span>:&nbsp;
              <a
                href={project.backendGitLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 no-underline hover:underline"
              >
                link
              </a>
              <span className="text-gray-400">,</span>
            </div>
          )}
          {project.demo && (
            <div className="ml-4 lg:ml-8 mr-2">
              <span className="text-white">preview</span>:&nbsp;
              <button
                onClick={() => {
                  const isDesktop = window.innerWidth >= 1024

                  if (!project.ready && !isDesktop) {
                    toast.info(
                      'This project is only available on desktop or laptop devices.'
                    )
                    return
                  }

                  window.open(project.demo, '_blank')
                }}
                className="text-blue-400 no-underline hover:underline cursor-pointer"
              >
                link
              </button>
              <span className="text-gray-400">,</span>
            </div>
          )}
          <div>
            <span className="text-gray-400">{'};'}</span>
          </div>
        </code>
      </div>
    </div>
  )
}

export default ProjectCard;
