/* eslint-disable unicorn/no-null */
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { motion } from "framer-motion";

// import styles from "./item.module.css";

export const Item = ({ id }: { id: UniqueIdentifier }) => {
  const { attributes, setNodeRef, listeners, transform, isDragging } =
    useSortable({
      id,
      transition: null,
    });

  return (
    <motion.div
      // className={styles.Item}
      // style={baseStyles}
      ref={setNodeRef}
      layoutId={String(id)}
      animate={
        transform
          ? {
              x: transform.x,
              y: transform.y,
              scale: isDragging ? 1.05 : 1,
              zIndex: isDragging ? 1 : 0,
              boxShadow: isDragging
                ? "0 0 0 1px rgba(63, 63, 68, 0.05), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
                : undefined,
            }
          : {
              x: 0,
              y: 0,
              scale: 1,
            }
      }
      transition={{
        duration: isDragging ? 0 : 0.25,
        easings: {
          type: "spring",
        },
        scale: {
          duration: 0.25,
        },
        zIndex: {
          delay: isDragging ? 0 : 0.25,
        },
      }}
      {...attributes}
      {...listeners}
    >
      {id}
    </motion.div>
  );
};
