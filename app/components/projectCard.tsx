'use client'

import Image from "next/image"

interface ProjectDescription {
  name: string,
  description: string,
  technologies: string[]
}

export default function ProjectCard(description: ProjectDescription) {
  return (
    <div className="p-2 max-w-sm rounded overflow-hidden shadow-lg border-solid border-2 border-blue-900 bg-white">
      <Image className="w-full" src="/images/card-top.jpg" alt="Sunset in the mountains" width={800} height={500} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">The Coldest Sunset</div>
        <p className="text-gray-700 text-base">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
        </p>
      </div>
      <div className="px-6 pt-4 pb-2">
        {description.technologies.map((tag) => (
          <span key={tag} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#{tag}</span>
        ))}
      </div>
    </div>
  )
}
