import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const loading = () => {
  return (
    <div className="w-full flex flex-col gap-3">
      <Skeleton width={500} height={60} className="mb-4" />
      <Skeleton width={350} height={50} />
      <Skeleton width={350} height={50} />
      <Skeleton width={350} height={50} />
    </div>
  );
};

export default loading;
