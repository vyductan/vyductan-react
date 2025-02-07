import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="w-full bg-pink-50 py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter text-pink-500 sm:text-5xl">
              About Sweet Delights
            </h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl">
              At Sweet Delights, we've been baking happiness since 1995. Our
              passion for creating delicious, beautiful cakes is matched only by
              our commitment to using the finest ingredients and time-honored
              recipes.
            </p>
            <p className="max-w-[600px] text-gray-500 md:text-xl">
              Every cake we make is a labor of love, designed to make your
              special moments even sweeter. From birthdays to weddings, or just
              because, we're here to add a touch of sweetness to your life.
            </p>
          </div>
          <div className="mx-auto flex items-center justify-center">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Our bakery"
              width={600}
              height={400}
              className="aspect-video overflow-hidden rounded-xl object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
