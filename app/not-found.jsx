// @flow strict

import Link from 'next/link'

function page() {
  return (
    <div className="min-h-[calc(100vh-128px-80px)] md:min-h-[calc(100vh-88px-80px)] lg:min-h-[calc(100vh-120px-80px)] flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100">
        404
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Page Not Found
      </p>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-10 group bg-gradient-to-r from-pink-500 to-violet-600 p-[1px] rounded-full transition-all duration-300 hover:from-violet-600 hover:to-pink-500"
      >
        <button className="flex items-center gap-1 hover:gap-3 px-3 md:px-8 py-3 md:py-4 rounded-full border-none text-xs md:text-sm font-medium uppercase tracking-wider transition-all duration-200 ease-out md:font-semibold bg-[#0d1224] text-white group-hover:bg-transparent group-hover:text-white w-full">
          <span>Go to Home</span>
        </button>
      </Link>
    </div>
  )
}

export default page
