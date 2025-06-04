// @flow strict

import { projectsData } from '../../../../utils/data/projects-data'
import ProjectCard from './project-card'

const Projects = () => {
  const baseTop = 100
  const headerHeight = 0

  return (
    <section
      id="projects"
      className="relative z-50 my-12 lg:my-24 min-h-[700px]"
    >
      <div className="sticky top-10 z-20">
        <div className="w-[80px] h-[80px] bg-violet-100 rounded-full absolute -top-3 left-0 translate-x-1/2 filter blur-3xl opacity-30"></div>
        <div className="flex items-center justify-start relative">
          <span className="bg-[#1a1443] absolute left-0 w-fit text-white px-5 py-3 text-xl rounded-md">
            PROJECTS
          </span>
          <span className="w-full h-[2px] bg-[#1a1443]"></span>
        </div>
      </div>

      <div className="pt-24">
        <div className="flex flex-col gap-40 relative">
          {projectsData.map((project, index) => (
            <div
              id={`sticky-card-${index + 1}`}
              key={index}
              className="sticky z-10 w-full mx-auto max-w-2xl"
              style={{ top: `${baseTop + index * headerHeight}px` }}
            >
              <div className="box-border flex items-center justify-center rounded transition-all duration-[0.5s]">
                <ProjectCard project={project} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
