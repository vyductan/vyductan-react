import Image from "next/image";

import { Button } from "@acme/ui/button";
import { CardContent, CardFooter, CardRoot } from "@acme/ui/card";

const featuredCakes = [
  {
    name: "Chocolate Dream",
    description: "Rich chocolate layers with creamy frosting",
    price: "$35.99",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Strawberry Delight",
    description: "Fresh strawberries atop vanilla sponge",
    price: "$32.99",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Lemon Zest",
    description: "Tangy lemon cake with light cream cheese frosting",
    price: "$30.99",
    image: "/placeholder.svg?height=300&width=300",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter text-pink-500 sm:text-5xl">
          Our Featured Cakes
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCakes.map((cake, index) => (
            <CardRoot key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={cake.image || "/placeholder.svg"}
                  alt={cake.name}
                  width={300}
                  height={300}
                  className="h-[200px] w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="mb-2 text-xl font-bold">{cake.name}</h3>
                  <p className="mb-2 text-gray-500">{cake.description}</p>
                  <p className="font-bold text-pink-500">{cake.price}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-pink-500 text-white hover:bg-pink-600">
                  Add to Cart
                </Button>
              </CardFooter>
            </CardRoot>
          ))}
        </div>
      </div>
    </section>
  );
}
