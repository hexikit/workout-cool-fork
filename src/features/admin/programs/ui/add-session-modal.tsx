"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ExerciseAttributeValueEnum } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "../../../../../locales/client";

import { generateSlugsForAllLanguages } from "@/shared/lib/slug";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { addSessionToWeek } from "../actions/add-session.action";

const getSessionSchema = (t: any) =>
  z.object({
    title: z.string().min(1, t("admin.programs.add_session_modal.validation.title_required")),
    description: z.string().min(1, t("admin.programs.add_session_modal.validation.description_required")),
    estimatedMinutes: z.number().min(5, t("admin.programs.add_session_modal.validation.estimated_minutes_min")),
    isPremium: z.boolean(),
    equipment: z.array(z.nativeEnum(ExerciseAttributeValueEnum)),
  });

type SessionFormData = z.infer<ReturnType<typeof getSessionSchema>>;

interface AddSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekId: string;
  nextSessionNumber: number;
}

const getEquipmentOptions = (t: any) => [
  { value: ExerciseAttributeValueEnum.BODY_ONLY, label: t("admin.programs.add_session_modal.equipment.body_only") },
  { value: ExerciseAttributeValueEnum.DUMBBELL, label: t("admin.programs.add_session_modal.equipment.dumbbell") },
  { value: ExerciseAttributeValueEnum.BARBELL, label: t("admin.programs.add_session_modal.equipment.barbell") },
  { value: ExerciseAttributeValueEnum.KETTLEBELLS, label: t("admin.programs.add_session_modal.equipment.kettlebells") },
  { value: ExerciseAttributeValueEnum.BANDS, label: t("admin.programs.add_session_modal.equipment.bands") },
  { value: ExerciseAttributeValueEnum.MACHINE, label: t("admin.programs.add_session_modal.equipment.machine") },
  { value: ExerciseAttributeValueEnum.CABLE, label: t("admin.programs.add_session_modal.equipment.cable") },
];

export function AddSessionModal({ open, onOpenChange, weekId, nextSessionNumber }: AddSessionModalProps) {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("en");
  const [selectedEquipment, setSelectedEquipment] = useState<ExerciseAttributeValueEnum[]>([]);

  const sessionSchema = getSessionSchema(t);
  const EQUIPMENT_OPTIONS = getEquipmentOptions(t);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: t("admin.programs.add_session_modal.title_fr_placeholder", { number: nextSessionNumber }),
      description: t("admin.programs.add_session_modal.description_fr_placeholder"),
      estimatedMinutes: 30,
      isPremium: true,
      equipment: [],
    },
  });

  const toggleEquipment = (equipment: ExerciseAttributeValueEnum) => {
    const newEquipment = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter((e) => e !== equipment)
      : [...selectedEquipment, equipment];

    setSelectedEquipment(newEquipment);
    setValue("equipment", newEquipment);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const slugs = generateSlugsForAllLanguages({
        title: data.title,
        titleEn: data.title,
        titleEs: data.title,
        titlePt: data.title,
        titleRu: data.title,
        titleZhCn: data.title,
      });

      await addSessionToWeek({
        weekId,
        sessionNumber: nextSessionNumber,
        ...data,
        ...slugs,
        titleEn: "",
        titleEs: "",
        titlePt: "",
        titleRu: "",
        titleZhCn: "",
        descriptionEn: "",
        descriptionEs: "",
        descriptionPt: "",
        descriptionRu: "",
        descriptionZhCn: "",
      });

      reset();
      setSelectedEquipment([]);
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Error adding session:", error);
      alert(t("admin.programs.add_session_modal.add_session_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEquipment([]);
    setActiveTab("fr");
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.programs.add_session_modal.title")}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t("admin.programs.add_session_modal.title_en_label")}</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder={t("admin.programs.add_session_modal.title_en_placeholder", { number: nextSessionNumber })}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">{t("admin.programs.add_session_modal.description_en_label")}</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder={t("admin.programs.add_session_modal.description_en_placeholder")}
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedMinutes">{t("admin.programs.add_session_modal.estimated_duration_label")}</Label>
              <Input id="estimatedMinutes" min="5" type="number" {...register("estimatedMinutes", { valueAsNumber: true })} />
              {errors.estimatedMinutes && <p className="text-sm text-red-500 mt-1">{errors.estimatedMinutes.message}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch defaultChecked={true} id="isPremium" onCheckedChange={(checked) => setValue("isPremium", checked)} />
              <Label htmlFor="isPremium">{t("admin.programs.add_session_modal.premium_session_label")}</Label>
            </div>
          </div>

          <div>
            <Label>{t("admin.programs.add_session_modal.required_equipment_label")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EQUIPMENT_OPTIONS.map((option) => (
                <Badge
                  className="cursor-pointer"
                  key={option.value}
                  onClick={() => toggleEquipment(option.value)}
                  variant={selectedEquipment.includes(option.value) ? "default" : "outline"}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleClose} type="button" variant="outline">
              {t("admin.programs.add_session_modal.cancel")}
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading
                ? t("admin.programs.add_session_modal.adding_session")
                : t("admin.programs.add_session_modal.add_session")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
