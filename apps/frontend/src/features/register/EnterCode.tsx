import React, { useState } from "react";
import { SigninTokenSchema } from "@types";
import { toast } from "sonner";
import { RegisterHeader } from "./RegisterHeader";
import { AppButton } from "@/components/ui/Button";
import { AppCopy } from "@/components/ui/AppCopy";

interface EnterCodeProps {
  chipIssuer: string | null;
  email: string;
  submitCode: (code: string) => Promise<void>;
}

const EnterCode: React.FC<EnterCodeProps> = ({ email, submitCode }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedCode = code.join("");
      SigninTokenSchema.parse(normalizedCode);
      await submitCode(normalizedCode);
    } catch (error) {
      console.error(error);
      toast.error("Please enter a valid 6-digit code");
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <RegisterHeader
        title="Enter the 6-digit code "
        description={`Sent to ${email} - expires in 15 minutes.`}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex flex-col gap-2 mt-20">
            <div className="flex justify-between">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ))}
            </div>
            <span className=" text-xs font-sans text-tertiary text-center">
              Check your spam folder if you didn’t receive a code.
            </span>
          </div>
        </div>
        <AppButton type="submit">Verify Code</AppButton>
      </form>
      <AppCopy className=" mt-auto mx-auto absolute bottom-5 text-center justify-center left-1/2 -translate-x-1/2" />
    </div>
  );
};

export default EnterCode;
