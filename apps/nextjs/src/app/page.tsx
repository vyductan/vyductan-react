import AboutUs from "~/components/about-us";
import FeaturedProducts from "~/components/featured-products";
import Footer from "~/components/footer";
import Header from "~/components/header";
import Hero from "~/components/hero";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <FeaturedProducts />
      <AboutUs />
      <Footer />
    </main>
  );
}
