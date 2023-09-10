import React from 'react';

interface ArrowProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const PrevArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return <div onClick={onClick}></div>;
};
