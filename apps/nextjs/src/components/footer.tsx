import Link from "next/link";

import { Icon } from "@acme/ui/icons";

export default function Footer() {
  return (
    <footer className="w-full bg-pink-100 py-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-pink-500">Sweet Delights</h3>
            <p className="text-sm text-gray-500">Baking happiness since 1995</p>
          </div>
          <nav className="space-y-2">
            <h3 className="text-lg font-bold text-pink-500">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Cakes
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Custom Orders
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  About Us
                </Link>
              </li>
            </ul>
          </nav>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-pink-500">Contact Us</h3>
            <p className="text-sm">123 Cake Street, Sweetville</p>
            <p className="text-sm">Phone: (555) 123-4567</p>
            <p className="text-sm">Email: info@sweetdelights.com</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-pink-500">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-pink-500">
                <Icon icon="icon-[logos--facebook]" className="size-6" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-pink-500">
                <Icon icon="icon-[skill-icons--instagram]" className="size-6" />
              </Link>
              {/* <Link href="#" className="text-gray-500 hover:text-pink-500"> */}
              {/*   <Twitter className="h-6 w-6" /> */}
              {/* </Link> */}
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2023 Sweet Delights. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
