import { useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "../../employees/hooks/useEmployees";
import { useMyDeclaration, useTaxDeclarationActions } from "../../tax-declaration/hooks/useTaxDeclaration";
import DeclarationForm from "../../tax-declaration/components/DeclarationForm";
import DeclarationSummary from "../../tax-declaration/components/DeclarationSummary";

export default function IncomeTaxDeclarationTab() {
  const currentUser = useCurrentUser();
  const declaration = useMyDeclaration();
  const { add, update } = useTaxDeclarationActions();
  const [editing, setEditing] = useState(false);

  const handleSubmit = (form) => {
    const payload = { ...form, status: "Submitted", submittedOn: new Date().toISOString().split("T")[0] };
    if (declaration) {
      update(declaration.id, payload);
      toast.success("Tax declaration updated");
    } else {
      add({ id: `TD${Date.now()}`, ...payload });
      toast.success("Tax declaration submitted");
    }
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {declaration && !editing ? (
        <DeclarationSummary declaration={declaration} onEdit={() => setEditing(true)} />
      ) : (
        <DeclarationForm
          currentUser={currentUser}
          existing={declaration}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}
