import { NewsGrid } from "@/components/grid/NewsGrid";
import { GridState } from "@/types";
import { PostFooter } from "@/components/post/PostFooter";
import { Metadata } from "next";
import { loadGridStateLocal } from "@/services/local-storage";
import { loadGridStateRedis } from "@/services/redis";
import { isDevelopment } from "@/services/config";
import { ArticleSupportModal } from "@/components/post/ArticleSupportModal";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Página UM",
  description: "O jornalismo independente só depende dos leitores.",
};

async function getInitialState(): Promise<GridState | null> {
  try {
    if (isDevelopment) {
      return await loadGridStateLocal();
    } else {
      const gridState = await loadGridStateRedis();
      return gridState;
    }
  } catch (error) {
    console.error("Failed to load initial grid state:", error);
    return null;
  }
}

export default async function HomePage() {
  const initialState = await getInitialState();
  if (!initialState) {
    return (
      <main className="max-w-7xl mx-auto pb-8">
        <div className="p-8 text-center text-gray-500">
          <p>Failed to load content. Please try again later.</p>
        </div>
      </main>
    );
  }
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto pb-8">
        <NewsGrid blocks={initialState.blocks} />
      </main>
      <PostFooter />
    </>
  );
}
