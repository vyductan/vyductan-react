import Link from "next/link";

import { Button } from "@acme/ui/button";
import { Icon } from "@acme/ui/icons";

export default function Header() {
  return (
    <header className="flex h-20 w-full items-center border-b px-4 lg:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Icon icon="icon-[lucide--cake]" className="size-8 text-pink-500" />
          <span className="text-2xl font-bold text-pink-500">
            Sweet Delights
          </span>
        </Link>
        <nav className="hidden space-x-6 md:flex">
          <Link href="#" className="text-sm font-medium hover:text-pink-500">
            Home
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-pink-500">
            Cakes
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-pink-500">
            Custom Orders
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-pink-500">
            About Us
          </Link>
        </nav>
        <Button
          variant="outline"
          className="bg-pink-100 text-pink-500 hover:bg-pink-200"
        >
          Order Now
        </Button>
      </div>
    </header>
  );
}
