import { Icon } from "@acme/ui/icons";

const features = [
  {
    title: "Easy Integration",
    description: "Seamlessly integrate with your existing tech stack.",
  },
  {
    title: "Scalable Architecture",
    description:
      "Built to grow with your business, from startup to enterprise.",
  },
  {
    title: "Real-time Analytics",
    description: "Get insights into your application's performance instantly.",
  },
  {
    title: "24/7 Support",
    description: "Our team is always here to help you succeed.",
  },
];

export default function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
          Our Features
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <Icon
                icon="icon-[lucide--check-circle]"
                className="mb-4 size-12 text-primary"
              />
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
