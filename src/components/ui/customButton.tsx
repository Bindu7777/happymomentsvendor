import React from "react";
import styled from "styled-components";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
}

const CustomButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
}) => {
  return (
    <StyledButton onClick={onClick} variant={variant} size={size}>
      <span>{children}</span>
    </StyledButton>
  );
};

const StyledButton = styled.button<{ variant: string; size: string }>`
  display: inline-block;
  border-radius: 10px;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease-in;
  z-index: 1;
  font-weight: bold;
  cursor: pointer;

  ${({ size }) =>
    size === "small"
      ? "width: 120px; height: 40px; font-size: 14px;"
      : size === "medium"
      ? "width: 150px; height: 50px; font-size: 16px;"
      : "width: 180px; height: 60px; font-size: 18px;"}

  ${({ variant }) =>
    variant === "primary"
      ? "background: #03045e; color: white; border-color: #03045e;"
      : variant === "secondary"
      ? "background: #5a189a; color: white; border-color: #5a189a;"
      : "background: #d90429; color: white; border-color: #d90429;"}

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.95);
  }

  span {
    position: relative;
    z-index: 2;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    width: 0;
    height: 100%;
    transform: skew(15deg);
    transition: all 0.5s;
    z-index: -1;
  }

  &::before {
    left: -10px;
    background: rgba(255, 255, 255, 0.2);
  }

  &::after {
    right: -10px;
    background: rgba(255, 255, 255, 0.1);
  }

  &:hover::before,
  &:hover::after {
    width: 58%;
  }
`;

export default CustomButton;
