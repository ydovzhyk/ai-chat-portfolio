// @flow strict
import Link from 'next/link';
import Image from 'next/image'
import logo from '../../public/logo.png'

function Footer() {
  return (
    <div className="relative border-t bg-[#0d1224] border-[#353951] text-white">
      <div className="mx-auto px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] py-6 lg:py-10">
        <div className="flex justify-center -z-40">
          <div className="absolute top-0 h-[1px] w-1/2  bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm">
            © Portfolio by{' '}
            <Link
              target="_blank"
              href="https://www.linkedin.com/in/yuriy-dovzhyk/"
              className="text-[#16f2b3]"
            >
              Yuriy Dovzhyk
            </Link>
          </p>
          <div className="flex flex-shrink-0 items-center">
            <Link href="/" className=" text-[#16f2b3] text-3xl font-bold">
              <Image
                src={logo}
                width={130}
                alt="pfile photo"
                className="rounded-lg transition-all duration-1000 grayscale hover:grayscale-0 hover:scale-110 cursor-pointer"
              />
            </Link>
          </div>
          <p className="text-sm">Updated 2025</p>
        </div>
      </div>
    </div>
  )
};

export default Footer;