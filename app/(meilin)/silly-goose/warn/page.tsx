import Link from "next/link";

export default function Warn() {
  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center mb-[10rem]">
        <p className="text-base font-semibold text-indigo-600">Hey now!</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Screen size too small!
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry silly goose, your car&apos;s extended waranty has expired.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/silly-goose/happy-birthday"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </Link>
          <Link
            href="/silly-goose/warn"
            className="text-sm font-semibold text-gray-900"
          >
            Contact support (Not that there is any){" "}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
