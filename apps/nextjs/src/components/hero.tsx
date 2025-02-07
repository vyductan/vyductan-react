import Image from "next/image";

import { Button } from "@acme/ui/button";

export default function Hero() {
  return (
    <section className="w-full bg-pink-50 py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-pink-500 sm:text-5xl xl:text-6xl/none">
                Delicious Cakes for Every Occasion
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl">
                Indulge in our handcrafted cakes made with love and the finest
                ingredients. Perfect for birthdays, weddings, or just because!
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="bg-pink-500 text-white hover:bg-pink-600">
                Order Now
              </Button>
              <Button variant="outline" className="text-pink-500">
                View Menu
              </Button>
            </div>
          </div>
          <div className="mx-auto flex items-center justify-center">
            <Image
              src="/placeholder.svg?height=550&width=550"
              alt="Beautiful cake display"
              width={550}
              height={550}
              className="aspect-square overflow-hidden rounded-xl object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
