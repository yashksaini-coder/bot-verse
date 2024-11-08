import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SERVER_URL } from "@/lib/utils";
import { useOcrMagic } from "@/stores/modal-store";
import axios from "axios";
import { useState } from "react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

import { X } from "lucide-react";

import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";

export default function OcrMagicModal() {
  const modal = useOcrMagic();
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOcrSubmit = async (event: any) => {
    event.preventDefault();
    setOcrText("");
    if (!selectedFile) return toast.error("Please select a file!");

    const formData = new FormData();
    formData.append("file", selectedFile);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const authHeaders = {
        Authorization: `Bearer ${token || ""}`,
      };
      const response = await axios.post(`${SERVER_URL}/api/ocr`, formData, {
        headers: authHeaders,
      });
      setOcrText(response.data.text);
    } catch (error) {
      console.error("Error fetching OCR text:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={modal.isOpen} onOpenChange={() => modal.onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex items-center justify-between">
              <p>OCR Magic Tool</p>
              <Button
                variant={"outline"}
                size={"icon"}
                className="rounded-full"
                onClick={() => modal.onClose()}
              >
                <X />
              </Button>
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Extract Text from Image.
          </AlertDialogDescription>
          <div className="grid gap-4 w-full">
            {imagePreview && (
              <div className="relative aspect-video">
                <img
                  src={imagePreview}
                  alt="Uploaded image preview"
                  className="object-contain w-full h-full"
                />
              </div>
            )}
            {loading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[75%]" />
              </div>
            )}
            {ocrText && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">{ocrText}</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <form
                onSubmit={handleOcrSubmit}
                className="w-full flex items-center flex-col gap-4"
              >
                <Input
                  disabled={loading}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="cursor-pointer"
                />
                <Button
                  disabled={loading}
                  className="w-full"
                  variant={"outline"}
                  type="submit"
                >
                  {loading ? "Extracting..." : "Extract"}
                </Button>
              </form>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}