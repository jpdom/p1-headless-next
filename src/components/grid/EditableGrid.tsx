import React, { Suspense, useEffect, useMemo, useRef } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { CategoryBlock, StaticBlock, StoryBlock } from "../../types";
import { BlockWrapper } from "../admin/BlockWrapper";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { GripVertical, Loader } from "lucide-react";
import { CategoryBlockClient } from "../blocks/CategoryBlock.client";
import { NewsStoryClient } from "../blocks/NewsStory/NewsStory.client";
import { ROW_HEIGHT } from "@/constants/blocks";
import { useGrid } from "@/components/ui/GridContext";
import { CategoryCarouselClient } from "../ui/CategoryCarousel.client";

const ReactGridLayout = WidthProvider(RGL);

interface EditableGridProps {
  columns: number;
}

export function EditableGrid({ columns }: EditableGridProps) {
  const { gridState, handleLayoutChange, allPostsIdsInStoryBlock } = useGrid();

  const { blocks } = gridState || { blocks: [] };

  // Convert grid positions to layout items
  const layout = useMemo(
    () =>
      blocks.map((block) => ({
        i: block.uId,
        x: block.gridPosition?.x || 0,
        y: block.gridPosition?.y || 0,
        w: block.gridPosition?.width || 2,
        h: block.gridPosition?.height || 2,
        minW: 1,
        maxW: columns,
        minH: 1,
        maxH: 12,
      })),
    [blocks, columns]
  );

  return (
    <ReactGridLayout
      layout={layout}
      className="layout bg-gray-50 p-4 border border-gray-200 rounded-md"
      cols={columns}
      rowHeight={ROW_HEIGHT}
      containerPadding={[0, 24]}
      margin={[16, 16]}
      preventCollision={true}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".drag-handle"
      resizeHandles={["se", "sw", "ne", "nw"]}
      // Improve dragging behavior
      isDroppable={false}
      useCSSTransforms={true}
      transformScale={1}
      droppingItem={{ i: "__dropping-elem__", w: 2, h: 2 }}
      allowOverlap={false}
      compactType={null}
      // Add delay before drag starts
    >
      {blocks.map((block) => {
        const isLandscape =
          block.gridPosition.width * 1.5 > block.gridPosition.height;
        return (
          <div key={block.uId} className="group">
            <BlockWrapper title={block.blockType} block={block}>
              <div className="relative h-full">
                {block.blockType === "category" ? (
                  <Suspense
                    fallback={
                      <Loader className="w-8 h-8 animate-spin mx-auto" />
                    }
                  >
                    {isLandscape ? (
                      <CategoryCarouselClient
                        block={block as CategoryBlock}
                        totalPosts={12}
                        cardsPerView={block.postsPerPage}
                        excludePostIds={allPostsIdsInStoryBlock}
                      />
                    ) : (
                      <CategoryBlockClient
                        block={block}
                        excludePostIds={allPostsIdsInStoryBlock}
                      />
                    )}
                  </Suspense>
                ) : block.blockType === "static" ? (
                  <StaticBlockComponent block={block} isAdmin={true} />
                ) : (
                  <Suspense
                    fallback={
                      <Loader className="w-8 h-8 animate-spin mx-auto" />
                    }
                  >
                    <NewsStoryClient story={block} />
                  </Suspense>
                )}
              </div>
            </BlockWrapper>
          </div>
        );
      })}
    </ReactGridLayout>
  );
}
