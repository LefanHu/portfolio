import ProjectCard from "@/components/projectCard"

const products = [
  {
    id: 1,
    name: 'Earthen Bottle',
    href: '#',
    price: '$48',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-01.jpg',
    imageAlt: 'Tall slender porcelain bottle with natural clay textured body and cork stopper.',
  },
  {
    id: 2,
    name: 'Nomad Tumbler',
    href: '#',
    price: '$35',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-02.jpg',
    imageAlt: 'Olive drab green insulated bottle with flared screw lid and flat top.',
  },
  {
    id: 3,
    name: 'Focus Paper Refill',
    href: '#',
    price: '$89',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-03.jpg',
    imageAlt: 'Person using a pen to cross a task off a productivity paper card.',
  },
  {
    id: 4,
    name: 'Machined Mechanical Pencil',
    href: '#',
    price: '$35',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-04.jpg',
    imageAlt: 'Hand holding black machined steel mechanical pencil with brass tip and top.',
  },
  // More products...
]

const projects = [
  {
    name: "project 1",
    description: "some description",
    technologies: ["AWS", "Redis", "Flamingo"]
  },
  {
    name: "project 2",
    description: "some description2",
    technologies: ["AWS", "Redis", "Flamingo"]
  },
  {
    name: "project 3",
    description: "some description",
    technologies: ["AWS", "Redis", "Flamingo"]
  },
  {
    name: "project 4",
    description: "some description2",
    technologies: ["AWS", "Redis", "Flamingo"]
  },
  {
    name: "project 5",
    description: "some description",
    technologies: ["AWS", "Redis", "Flamingo"]
  },
  {
    name: "project 6",
    description: "some description2",
    technologies: ["AWS", "Redis", "Flamingo"]
  },
  {
    name: "project 7",
    description: "some description",
    technologies: ["AWS", "Redis", "Flamingo"]
  },
]

export default function Projects() {
  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {projects.map((project) => (
            <a key={project.name} href={project.name} className="group">
              {/* <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p> */}
              <ProjectCard
                name={project.name}
                description={project.description}
                technologies={project.technologies}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
