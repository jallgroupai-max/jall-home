import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb, MessageSquare, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackService, FeedbackType as ApiFeedbackType, FeedbackCategory, CreateFeedbackDto } from "@/lib/feedback.service";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "type" | "questions" | "tool" | "thanks";
type DialogFeedbackType = "feedback" | "tool"; // Renamed to avoid collision

const FeedbackDialog = ({ open, onOpenChange }: FeedbackDialogProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { token } = useAuth();
  const [step, setStep] = useState<Step>("type");
  const [feedbackType, setFeedbackType] = useState<DialogFeedbackType | "">("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [additionalComments, setAdditionalComments] = useState("");
  const [toolName, setToolName] = useState("");
  const [toolReason, setToolReason] = useState("");

  // ... (leanStartupQuestions array remains same) ...
  const leanStartupQuestions = [
    {
      id: "frequency",
      questionKey: "feedback.q1",
      options: [
        { value: "daily", labelKey: "feedback.q1.daily" },
        { value: "weekly", labelKey: "feedback.q1.weekly" },
        { value: "monthly", labelKey: "feedback.q1.monthly" },
        { value: "rarely", labelKey: "feedback.q1.rarely" },
      ],
    },
    {
      id: "problem",
      questionKey: "feedback.q2",
      options: [
        { value: "cost", labelKey: "feedback.q2.cost" },
        { value: "access", labelKey: "feedback.q2.access" },
        { value: "learning", labelKey: "feedback.q2.learning" },
        { value: "quality", labelKey: "feedback.q2.quality" },
      ],
    },
    {
      id: "value",
      questionKey: "feedback.q3",
      options: [
        { value: "price", labelKey: "feedback.q3.price" },
        { value: "payment", labelKey: "feedback.q3.payment" },
        { value: "variety", labelKey: "feedback.q3.variety" },
        { value: "simplicity", labelKey: "feedback.q3.simplicity" },
      ],
    },
    {
      id: "recommend",
      questionKey: "feedback.q4",
      options: [
        { value: "definitely", labelKey: "feedback.q4.definitely" },
        { value: "probably", labelKey: "feedback.q4.probably" },
        { value: "not_sure", labelKey: "feedback.q4.notSure" },
        { value: "no", labelKey: "feedback.q4.no" },
      ],
    },
  ];

  const resetDialog = () => {
    setStep("type");
    setFeedbackType("");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setAdditionalComments("");
    setToolName("");
    setToolReason("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetDialog();
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!token) return;

    try {
      let data: CreateFeedbackDto;

      if (feedbackType === "tool") {
        data = {
          type: ApiFeedbackType.SUGGESTION,
          category: FeedbackCategory.TOOL,
          message: `Tool: ${toolName}. Reason: ${toolReason}`,
        };
      } else {
        // Feedback
        const formattedMessage = Object.entries(answers)
          .map(([qId, answer]) => `${qId}: ${t(leanStartupQuestions.find(q => q.id === qId)?.options.find(o => o.value === answer)?.labelKey || answer)}`)
          .join('\n');
        
        data = {
          type: ApiFeedbackType.OTHER,
          category: FeedbackCategory.DASHBOARD,
          message: `${formattedMessage}\n\nAdditional Comments: ${additionalComments}`,
        };
      }

      await feedbackService.create(data, token);

      toast({
        title: t("feedback.toast"),
        description: t("feedback.toastDesc"),
      });
      setStep("thanks");
    } catch (error) {
       console.error(error);
       toast({
        title: "Error",
        description: "Failed to send feedback",
        variant: "destructive",
      });
    }
  };

  // ... (currentQuestion logic)
  const currentQuestion = leanStartupQuestions[currentQuestionIndex];

  const goNext = () => {
    if (step === "type") {
      if (feedbackType === "feedback") {
        setStep("questions");
      } else {
        setStep("tool");
      }
    } else if (step === "questions") {
      if (currentQuestionIndex < leanStartupQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmit();
      }
    } else if (step === "tool") {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (step === "questions") {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else {
        setStep("type");
      }
    } else if (step === "tool") {
      setStep("type");
    }
  };

  const canProceed = () => {
    if (step === "type") return !!feedbackType;
    if (step === "questions") return !!answers[currentQuestion?.id];
    if (step === "tool") return toolName.trim().length >= 2;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {step === "type" && t("feedback.typeTitle")}
                {step === "questions" && `${t("feedback.questionTitle")} ${currentQuestionIndex + 1} ${t("feedback.of")} ${leanStartupQuestions.length}`}
                {step === "tool" && t("feedback.toolTitle")}
                {step === "thanks" && t("feedback.thanksTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {step === "type" && t("feedback.typeDesc")}
                {step === "questions" && t(currentQuestion?.questionKey)}
                {step === "tool" && t("feedback.toolDesc")}
                {step === "thanks" && t("feedback.thanksDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-4">
          {/* Step 1: Type Selection */}
          {step === "type" && (
            <RadioGroup 
              value={feedbackType} 
              onValueChange={(value) => setFeedbackType(value as DialogFeedbackType)} 
              className="space-y-3"
            >
              <Label
                htmlFor="feedback"
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  feedbackType === "feedback"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <RadioGroupItem value="feedback" id="feedback" />
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  feedbackType === "feedback" ? "bg-primary/20" : "bg-secondary"
                }`}>
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t("feedback.giveFeedback")}</p>
                  <p className="text-xs text-muted-foreground">{t("feedback.giveFeedbackDesc")}</p>
                </div>
              </Label>
              <Label
                htmlFor="tool"
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  feedbackType === "tool"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <RadioGroupItem value="tool" id="tool" />
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  feedbackType === "tool" ? "bg-accent/20" : "bg-secondary"
                }`}>
                  <Wrench className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium">{t("feedback.suggestTool")}</p>
                  <p className="text-xs text-muted-foreground">{t("feedback.suggestToolDesc")}</p>
                </div>
              </Label>
            </RadioGroup>
          )}

          {/* Step 2: Questions */}
          {step === "questions" && currentQuestion && (
            <div className="space-y-4">
              <RadioGroup 
                value={answers[currentQuestion.id] || ""} 
                onValueChange={(value) => setAnswers({ ...answers, [currentQuestion.id]: value })}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      answers[currentQuestion.id] === option.value
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <span className="font-medium text-sm">{t(option.labelKey)}</span>
                  </Label>
                ))}
              </RadioGroup>

              {currentQuestionIndex === leanStartupQuestions.length - 1 && (
                <div className="space-y-2 pt-4">
                  <Label htmlFor="comments">{t("feedback.additionalComments")}</Label>
                  <Textarea
                    id="comments"
                    placeholder={t("feedback.commentsPlaceholder")}
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Tool Suggestion */}
          {step === "tool" && (
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/30 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t("feedback.toolExamples")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toolName">{t("feedback.toolName")}</Label>
                <Input
                  id="toolName"
                  placeholder="Ej: Midjourney"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toolReason">{t("feedback.toolReason")}</Label>
                <Textarea
                  id="toolReason"
                  placeholder={t("feedback.toolReasonPlaceholder")}
                  value={toolReason}
                  onChange={(e) => setToolReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === "thanks" && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("feedback.received")}</h3>
              <p className="text-muted-foreground text-sm">
                {t("feedback.receivedDesc")}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {step !== "type" && step !== "thanks" && (
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-2xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("feedback.back")}
            </Button>
          )}
          {step !== "thanks" ? (
            <Button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex-1 rounded-2xl"
            >
              {step === "questions" && currentQuestionIndex === leanStartupQuestions.length - 1
                ? t("feedback.send")
                : step === "tool"
                ? t("feedback.sendSuggestion")
                : t("feedback.next")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => handleClose(false)} className="flex-1 rounded-2xl">
              {t("feedback.close")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
