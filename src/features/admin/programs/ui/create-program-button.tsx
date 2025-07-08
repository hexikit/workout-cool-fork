"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "../../../../../locales/client";

import { CreateProgramModal } from "./create-program-modal";

export function CreateProgramButton() {
  const t = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4" />
        {t("admin.programs.create_program_button.create_program")}
      </button>

      <CreateProgramModal onOpenChange={setIsModalOpen} open={isModalOpen} />
    </>
  );
}