export default function TaylorGeneratorPage() {
  return (
    <div className="flex-1 overflow-auto no-scrollbar bg-black">
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center py-12 gap-y-24 sm:py-16 lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-200 sm:text-4xl md:text-6xl bg-gradient-to-r from-gray-200 to-slate-300 bg-clip-text text-transparent">
            Stable Diffusion Project
          </h2>
          <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
          <p className="mt-4 text-gray-300 mb-5">
            Below are some of my personal interests that I enjoy doing in my
            free time. Although not everything is listed here, but it does
            highlight some of my personal favorites.
          </p>

          <div className="grid grid-cols-1 gap-y-2 p-4 bg-gray-800 bg-opacity-90 rounded-2xl">
            <h3 className="text-2xl font-bold">Project Overview</h3>
            <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
            <div className="flex flex-row">
              <p>something here bla bla bla </p>
              <div>{/* images here */}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
