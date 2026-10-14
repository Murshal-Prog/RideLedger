import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

describe("Design System Primitives", () => {
  describe("Button Component", () => {
    it("renders children correctly", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("handles click events", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Submit</Button>);
      fireEvent.click(screen.getByRole("button", { name: /submit/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("displays loading spinner and disables button when isLoading is true", () => {
      render(<Button isLoading>Save Data</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
    });

    it("applies primary and accent variants properly", () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-primary");

      rerender(<Button variant="accent">Accent</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-accent-amber");
    });
  });

  describe("Input Component", () => {
    it("renders label and associates with input", () => {
      render(<Input label="Odometer Reading" placeholder="e.g. 12450" />);
      expect(screen.getByLabelText(/odometer reading/i)).toBeInTheDocument();
    });

    it("displays error message when provided", () => {
      render(<Input label="Fare" error="Fare must be greater than zero" />);
      expect(screen.getByText("Fare must be greater than zero")).toBeInTheDocument();
    });
  });

  describe("StatCard Component", () => {
    it("displays placeholder notice when marked as placeholder", () => {
      render(
        <StatCard
          title="Today's Gross Income"
          value="₹--"
          isPlaceholder
          placeholderNotice="Awaiting ride entries"
        />
      );
      expect(screen.getByText("Today's Gross Income")).toBeInTheDocument();
      expect(screen.getByText("₹--")).toBeInTheDocument();
      expect(screen.getByText("Awaiting ride entries")).toBeInTheDocument();
    });
  });

  describe("Badge Component", () => {
    it("renders status badge correctly", () => {
      render(<Badge variant="online" dot>ONLINE</Badge>);
      expect(screen.getByText("ONLINE")).toBeInTheDocument();
    });
  });

  describe("Modal Component", () => {
    it("renders when isOpen is true and calls onClose when clicking close button", () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal Content</p>
        </Modal>
      );
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal Content")).toBeInTheDocument();

      const closeBtn = screen.getByLabelText("Close dialog");
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("ConfirmationDialog Component", () => {
    it("renders dialog message and triggers confirm action", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();
      render(
        <ConfirmationDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="End Work Session"
          message="Are you sure you want to end your active shift?"
          confirmText="Yes, Go Offline"
        />
      );

      expect(screen.getByText("End Work Session")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to end your active shift?")
      ).toBeInTheDocument();

      const confirmBtn = screen.getByRole("button", { name: "Yes, Go Offline" });
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
