import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      <Categories />
      <FeaturedProducts />
    </div>
  );
}
