"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ExerciseAttributeValueEnum } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";

import { useI18n } from "../../../../../locales/client";
import { generateSlug } from "@/shared/lib/slug";
import { allEquipmentValues, getEquipmentTranslation } from "@/shared/lib/workout-session/equipments";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { SessionWithExercises } from "../types/program.types";
import { updateSession } from "../actions/update-session.action";

const getSessionSchema = (t: ReturnType<typeof useI18n>) =>
  z.object({
    titleEn: z.string().min(1, t("admin.programs.edit_session_modal.validation.title_required")),
    descriptionEn: z.string().min(1, t("admin.programs.edit_session_modal.validation.description_required")),
    estimatedMinutes: z.number().min(5, t("admin.programs.edit_session_modal.validation.duration_too_short")),
    isPremium: z.boolean(),
    equipment: z.array(z.nativeEnum(ExerciseAttributeValueEnum)),
  });

type SessionFormData = z.infer<ReturnType<typeof getSessionSchema>>;

interface EditSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionWithExercises;
}

export function EditSessionModal({ open, onOpenChange, session }: EditSessionModalProps) {
  const t = useI18n();
  const sessionSchema = getSessionSchema(t);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<ExerciseAttributeValueEnum[]>(session.equipment);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      titleEn: session.titleEn,
      descriptionEn: session.descriptionEn,
      estimatedMinutes: session.estimatedMinutes,
      isPremium: session.isPremium,
      equipment: session.equipment,
    },
  });

  const toggleEquipment = (equipment: ExerciseAttributeValueEnum) => {
    const newEquipment = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter((e) => e !== equipment)
      : [...selectedEquipment, equipment];

    setSelectedEquipment(newEquipment);
    setValue("equipment", newEquipment);
  };

  const onSubmit = async (data: SessionFormData) => {
    setIsLoading(true);
    try {
      const slugEn = generateSlug(data.titleEn);

      await updateSession({
        sessionId: session.id,
        title: "",
        description: "",
        titleEn: data.titleEn,
        descriptionEn: data.descriptionEn,
        titleEs: "",
        descriptionEs: "",
        titlePt: "",
        descriptionPt: "",
        titleRu: "",
        descriptionRu: "",
        titleZhCn: "",
        descriptionZhCn: "",
        slug: slugEn, // Keep slug for backward compatibility
        slugEn,
        slugEs: "",
        slugPt: "",
        slugRu: "",
        slugZhCn: "",
        estimatedMinutes: data.estimatedMinutes,
        isPremium: data.isPremium,
        equipment: data.equipment,
      });

      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating session:", error);
      alert(t("admin.programs.edit_session_modal.error_message"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEquipment(session.equipment);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.programs.edit_session_modal.title")}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-titleEn">{t("admin.programs.edit_session_modal.labels.title")}</Label>
              <Input id="edit-titleEn" {...register("titleEn")} />
              {errors.titleEn && <p className="text-sm text-red-500 mt-1">{errors.titleEn.message}</p>}
            </div>
            <div>
              <Label htmlFor="edit-descriptionEn">{t("admin.programs.edit_session_modal.labels.description")}</Label>
              <Textarea id="edit-descriptionEn" {...register("descriptionEn")} rows={3} />
              {errors.descriptionEn && <p className="text-sm text-red-500 mt-1">{errors.descriptionEn.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-estimatedMinutes">
                {t("admin.programs.edit_session_modal.labels.estimated_duration")}
              </Label>
              <Input id="edit-estimatedMinutes" min="5" type="number" {...register("estimatedMinutes", { valueAsNumber: true })} />
              {errors.estimatedMinutes && <p className="text-sm text-red-500 mt-1">{errors.estimatedMinutes.message}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                defaultChecked={session.isPremium}
                id="edit-isPremium"
                onCheckedChange={(checked) => setValue("isPremium", checked)}
              />
              <Label htmlFor="edit-isPremium">{t("admin.programs.edit_session_modal.labels.premium_session")}</Label>
            </div>
          </div>

          <div>
            <Label>{t("admin.programs.edit_session_modal.labels.required_equipment")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allEquipmentValues.map((option) => (
                <Badge
                  className="cursor-pointer"
                  key={option}
                  onClick={() => toggleEquipment(option)}
                  variant={selectedEquipment.includes(option) ? "default" : "outline"}
                >
                  {getEquipmentTranslation(option, t, true) as string}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleClose} type="button" variant="outline">
              {t("admin.programs.edit_session_modal.buttons.cancel")}
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading
                ? t("admin.programs.edit_session_modal.buttons.updating")
                : t("admin.programs.edit_session_modal.buttons.update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
