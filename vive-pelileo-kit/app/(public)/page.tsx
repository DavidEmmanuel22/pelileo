import { HomeView } from "@/components/home/HomeView";
import { homeMedia } from "@/lib/media";

export default function HomePage() {
  return <HomeView media={homeMedia()} />;
}
