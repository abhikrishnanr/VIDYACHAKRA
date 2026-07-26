"use client";

import { RotateCcw } from "lucide-react";
import { useDemoState } from "@/lib/demo-state";
import { Modal } from "./Modal";

export function DemoResetDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { resetDemo } = useDemoState();
  return (
    <Modal open={open} onClose={onClose} title="Reset the demonstration">
      <div className="modal-body reset-dialog-copy">
        <span className="reset-dialog-icon"><RotateCcw size={22} /></span>
        <p>
          This restores the original scenario: CR-2026-014 returns to draft, the
          committee decision becomes pending and the seven-day theory examination
          deviation is marked red.
        </p>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onClose}>
            Keep current progress
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              resetDemo();
              onClose();
            }}
          >
            <RotateCcw size={15} /> Reset demo
          </button>
        </div>
      </div>
    </Modal>
  );
}
