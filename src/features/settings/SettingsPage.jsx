import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { Btn } from "../../shared/components/Btn";
import { FormField, inputCls } from "../../shared/components/Modal";
import { useCurrentUser } from "../employees/hooks/useEmployees";
import { useUniformQuery, useUniformMutations } from "./hooks/useUniformQuery";
import { isUniformEligible } from "./uniform.mock";
import { useFeedbackMutations } from "./hooks/useFeedbackQuery";
import { getRecipientsForLocation } from "./feedback.mock";
import { useSimulatedRole, useRoleActions } from "../../shared/access/role.store";
import "./settings.css";

const VIEW_AS_ROLES = ["Employee", "Manager", "HR Admin"];

export default function SettingsPage({ darkMode, onDarkMode }) {
  const [saved, setSaved] = useState(false);
  const currentUser = useCurrentUser();
  const simulatedRole = useSimulatedRole();
  const { setSimulatedRole } = useRoleActions();

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully");
    setTimeout(() => setSaved(false), 2000);
  };

  // --- Uniform Size Declaration ---
  const { data: uniformItems } = useUniformQuery();
  const { add: uniformAdd } = useUniformMutations();
  const eligible = isUniformEligible(currentUser.id);
  const myUniformRecord = uniformItems.find(r => r.employeeId === currentUser.id);
  const [collar, setCollar] = useState("");
  const [waist, setWaist] = useState("");
  const [height, setHeight] = useState("");

  const handleUniformSubmit = () => {
    if (!collar.trim() || !waist.trim() || !height.trim()) {
      toast.error("Please fill in all three size fields");
      return;
    }
    uniformAdd({
      id: `UNI-${currentUser.id}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      collar,
      waist,
      height,
      submittedOn: new Date().toISOString().split("T")[0],
    });
    toast.success("Uniform size declaration submitted");
  };

  // --- Employee Feedback ---
  const { add: feedbackAdd } = useFeedbackMutations();
  const recipients = getRecipientsForLocation(currentUser.location);
  const [feedbackText, setFeedbackText] = useState("");
  const [recipient, setRecipient] = useState(recipients[0] || "");

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback");
      return;
    }
    feedbackAdd({
      id: `FB-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      recipient: recipient || recipients[0],
      message: feedbackText,
      submittedOn: new Date().toISOString().split("T")[0],
    });
    toast.success("Feedback submitted successfully");
    setFeedbackText("");
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h2 className={cn("text-lg font-bold text-foreground", "animate-fade-in-up")} style={{ animationDelay: "0ms" }}>Settings</h2>

      <div className={cn("bg-card rounded-lg border border-border shadow-sm", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        <div className="py-4 px-5 border-b border-border font-semibold text-sm">View As</div>
        <div className="p-5 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            This app has no login, so your identity always stays {currentUser.name}. Use this switcher to simulate a
            different permission level for demo purposes — it hides or shows manager/admin-only actions accordingly.
          </p>
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
            {VIEW_AS_ROLES.map(r => (
              <button key={r} onClick={() => setSimulatedRole(r)}
                className={cn("py-1.5 px-4 text-sm font-medium rounded-md transition-colors text-muted-foreground bg-transparent border-none cursor-pointer hover:text-foreground", simulatedRole === r && "bg-card shadow text-foreground")}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("bg-card rounded-lg border border-border shadow-sm", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "120ms" }}>
        <div className="py-4 px-5 border-b border-border font-semibold text-sm">Profile Information</div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold animate-pop-in">RS</div>
            <div>
              <p className="font-semibold">Rajesh Sharma</p>
              <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
              <button className="text-xs text-primary mt-1 bg-transparent border-none cursor-pointer p-0 hover:underline">Change Photo</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label:"Full Name", value:"Rajesh Sharma" },
              { label:"Employee Code", value:"AMS1001" },
              { label:"Email", value:"rajesh.sharma@company.com" },
              { label:"Mobile", value:"+91 9876543210" },
              { label:"Department", value:"Executive" },
              { label:"Location", value:"Mumbai" },
            ].map(f=>(
              <div key={f.label} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">{f.label}</label>
                <input defaultValue={f.value}
                  className="border border-border rounded-md py-2 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"/>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("bg-card rounded-lg border border-border shadow-sm", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "180ms" }}>
        <div className="py-4 px-5 border-b border-border font-semibold text-sm">Appearance & Theme</div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark interface</p>
            </div>
            <button onClick={onDarkMode}
              className={cn("relative w-12 h-6 rounded-full transition-colors border-none cursor-pointer", darkMode ? "bg-primary" : "bg-muted")}>
              <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", darkMode ? "translate-x-7" : "translate-x-1")}/>
            </button>
          </div>
        </div>
      </div>

      <div className={cn("bg-card rounded-lg border border-border shadow-sm", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "240ms" }}>
        <div className="py-4 px-5 border-b border-border font-semibold text-sm">Notification Preferences</div>
        <div className="p-5 flex flex-col gap-4">
          {[
            { label:"Leave Approval Alerts", sub:"Get notified when leave is approved/rejected" },
            { label:"Attendance Reminders", sub:"Daily reminder to mark attendance" },
            { label:"Policy Updates", sub:"Alert when new policies are published" },
            { label:"Ticket Status Updates", sub:"Updates on your service desk tickets" },
            { label:"Training Due Alerts", sub:"Reminder for upcoming course deadlines" },
          ].map((n, i) => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.sub}</p>
              </div>
              <button className={cn("relative w-10 h-5 rounded-full transition-colors border-none cursor-pointer", i < 3 ? "bg-primary" : "bg-muted")}>
                <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform", i < 3 ? "translate-x-5" : "translate-x-0.5")}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {eligible && (
        <div className={cn("bg-card rounded-lg border border-border shadow-sm", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "300ms" }}>
          <div className="py-4 px-5 border-b border-border font-semibold text-sm">Uniform Size Declaration</div>
          <div className="p-5 flex flex-col gap-4">
            {myUniformRecord ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  You have already submitted your uniform sizes on {myUniformRecord.submittedOn}. This record is locked and cannot be edited.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Collar Size", value: myUniformRecord.collar },
                    { label: "Waist Size", value: myUniformRecord.waist },
                    { label: "Height", value: myUniformRecord.height },
                  ].map(f => (
                    <div key={f.label} className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted-foreground">{f.label}</label>
                      <input disabled value={f.value} className={cn(inputCls, "opacity-70 cursor-not-allowed")} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground">
                  Enter your uniform sizing details below. Once submitted, this record cannot be edited.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Collar Size">
                    <input value={collar} onChange={e => setCollar(e.target.value)} className={inputCls} placeholder='e.g. 16"' />
                  </FormField>
                  <FormField label="Waist Size">
                    <input value={waist} onChange={e => setWaist(e.target.value)} className={inputCls} placeholder='e.g. 34"' />
                  </FormField>
                  <FormField label="Height">
                    <input value={height} onChange={e => setHeight(e.target.value)} className={inputCls} placeholder={`e.g. 5'8"`} />
                  </FormField>
                </div>
                <div>
                  <Btn variant="primary" onClick={handleUniformSubmit}>I Agree & Submit</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={cn("bg-card rounded-lg border border-border shadow-sm", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "360ms" }}>
        <div className="py-4 px-5 border-b border-border font-semibold text-sm">Employee Feedback</div>
        <div className="p-5 flex flex-col gap-4">
          <FormField label="Your Feedback">
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="Share your feedback, suggestions or concerns..."
              className={cn(inputCls, "resize-none")}
            />
          </FormField>
          <FormField label="Send To">
            <select value={recipient} onChange={e => setRecipient(e.target.value)} className={inputCls}>
              {recipients.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>
          <div>
            <Btn variant="primary" onClick={handleFeedbackSubmit}>Submit Feedback</Btn>
          </div>
        </div>
      </div>

      <div className="flex gap-2 animate-fade-in-up" style={{ animationDelay: "420ms" }}>
        <Btn variant="primary" onClick={handleSave}>
          {saved ? <><Check size={14}/> Saved!</> : "Save Changes"}
        </Btn>
        <Btn variant="secondary" onClick={() => toast.info("Changes discarded")}>Discard</Btn>
      </div>
    </div>
  );
}
