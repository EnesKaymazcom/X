import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface AdminModalFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isConfirmDisabled?: boolean;
  isLoading?: boolean;
  showSpinner?: boolean;
}

export function AdminModalFooter({
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText,
  confirmVariant = "default",
  isConfirmDisabled = false,
  isLoading = false,
  showSpinner = false
}: AdminModalFooterProps) {
  const isProcessing = isLoading || showSpinner;
  
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
        {cancelText}
      </Button>
      <Button 
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={isConfirmDisabled || isProcessing}
        className="min-w-[100px]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {["sil", "delete"].includes(confirmText.toLowerCase()) ? "Siliniyor..." : 
             ["kaydet", "save"].includes(confirmText.toLowerCase()) ? "Kaydediliyor..." : 
             ["gönder", "submit"].includes(confirmText.toLowerCase()) ? "Gönderiliyor..." :
             "İşleniyor..."}
          </>
        ) : (
          confirmText
        )}
      </Button>
    </DialogFooter>
  );
}