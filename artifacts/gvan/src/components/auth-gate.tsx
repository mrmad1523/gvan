import { useState, type CSSProperties, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronDown, Crown, Eye, EyeOff, Heart, LockKeyhole, Mail, UserRound, VenusAndMars } from "lucide-react";
import { Link, useLocation } from "wouter";
import romanceImage from "@assets/0_1000245933_1793321089914.png";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export type DemoProfile = { fullName: string; email: string; age?: number; gender?: string };
const emailRule = z.string().trim().email("Enter a valid email address.");
const genderOptions = ["Male", "Female", "Other", "Prefer not to say"] as const;
const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Enter your password."),
});
const forgotPasswordSchema = z.object({ email: emailRule });
const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: emailRule,
  password: z.string().min(8, "Use at least 8 characters."),
  confirmPassword: z.string().min(1, "Confirm your password."),
  age: z.string().trim()
    .min(1, "Enter your age.")
    .regex(/^\d+$/, "Enter a whole-number age.")
    .refine(value => Number(value) >= 18, "You must be 18 or older to register.")
    .refine(value => Number(value) <= 120, "Enter an age no greater than 120."),
  gender: z.string().min(1, "Select your gender.")
    .refine(value => (genderOptions as readonly string[]).includes(value), "Select a valid gender."),
}).superRefine((values, context) => {
  if (values.password !== values.confirmPassword) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match.", path: ["confirmPassword"] });
  }
});

type AuthProps = { onAuthenticated: (profile: DemoProfile) => void };

function AuthBackdrop({ children, register = false }: { children: ReactNode; register?: boolean }) {
  return <div className={`auth-page ${register ? "auth-page-register" : ""}`} style={{ "--auth-photo": `url("${romanceImage}")` } as CSSProperties}>
    <div className="auth-photo" aria-hidden="true" />
    <main className="auth-layout">
      <div className="auth-visual-copy" aria-hidden="true">
        {!register && <div className="auth-wordmark-lockup">
          <Crown className="auth-wordmark-crown" size={22} strokeWidth={1.8} />
          <div className="auth-wordmark-hearts"><Heart size={20} /><Heart size={17} /></div>
          <div className="auth-wordmark">GVAN</div>
          <p className="auth-tagline"><span>Explore</span><i /><span>Connect</span><i /><span>Enjoy</span></p>
        </div>}
      </div>
      {children}
      <p className="auth-footer">A thoughtful space, made for you.</p>
    </main>
  </div>;
}

function PasswordInput({ field, testId, placeholder = "Password" }: { field: any; testId: string; placeholder?: string }) {
  const [visible, setVisible] = useState(false);
  return <div className="auth-input-wrap">
    <LockKeyhole className="auth-input-icon" size={19} aria-hidden="true" />
    <Input {...field} id={testId} type={visible ? "text" : "password"} placeholder={placeholder} autoComplete={testId.includes("confirm") ? "new-password" : "current-password"} className="auth-input auth-password-input" data-testid={testId} />
    <button type="button" className="auth-eye-button" onClick={() => setVisible(value => !value)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} data-testid={`${testId}-toggle`}>
      {visible ? <EyeOff size={19} /> : <Eye size={19} />}
    </button>
  </div>;
}

export function Login({ onAuthenticated }: AuthProps) {
  const [, setLocation] = useLocation();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const submit = (values: z.infer<typeof loginSchema>) => {
    const savedProfile = localStorage.getItem("gvan-demo-profile");
    let fullName = values.email.split("@")[0].replace(/[._-]+/g, " ").trim();
    let matchedProfile: DemoProfile | null = null;
    try {
      const parsed = savedProfile ? JSON.parse(savedProfile) as DemoProfile : null;
      if (parsed?.email === values.email.trim()) {
        matchedProfile = parsed;
        fullName = parsed.fullName;
      }
    } catch { /* A malformed local demo profile is ignored. */ }
    onAuthenticated({ ...matchedProfile, fullName: fullName || "Friend", email: values.email.trim() });
    setLocation("/");
  };

  return <AuthBackdrop>
    <section className="auth-card auth-card-login" aria-labelledby="auth-title" data-testid="panel-login">
      <div className="auth-switch" aria-label="Account access">
        <span className="auth-switch-active" aria-current="page">Login</span>
        <Link href="/register" data-testid="link-login-register">Register</Link>
      </div>
      <h1 id="auth-title" className="sr-only">Log in to Gvan</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="auth-form" noValidate data-testid="form-login">
          <FormField control={form.control} name="email" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Email address</FormLabel>
            <FormControl><div className="auth-input-wrap"><Mail className="auth-input-icon" size={19} aria-hidden="true" /><Input {...field} id="login-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="auth-input" data-testid="input-login-email" /></div></FormControl>
            <FormMessage className="auth-error" data-testid="error-login-email" />
          </FormItem>} />
          <FormField control={form.control} name="password" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Password</FormLabel>
            <FormControl><PasswordInput field={field} testId="input-login-password" /></FormControl>
            <FormMessage className="auth-error" data-testid="error-login-password" />
          </FormItem>} />
          <Link href="/forgot-password" className="auth-forgot-link" data-testid="link-forgot-password">Forgot Password?</Link>
          <p className="auth-demo-note" role="note" data-testid="notice-demo-auth">Demo only; not secure authentication. Your password is never saved or sent.</p>
          <Button type="submit" className="auth-submit" data-testid="button-login-submit" disabled={form.formState.isSubmitting}>
            Login <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      </Form>
    </section>
  </AuthBackdrop>;
}

export function ForgotPassword() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });
  const submit = (values: z.infer<typeof forgotPasswordSchema>) => {
    setSubmittedEmail(values.email.trim());
  };

  return <AuthBackdrop>
    <section className="auth-card auth-forgot-card" aria-labelledby="forgot-password-title" data-testid="panel-forgot-password">
      <h2 id="forgot-password-title">Reset Your Password</h2>
      <p className="auth-forgot-intro">Enter your registered email address.</p>
      {submittedEmail ? <div className="auth-reset-confirmation" role="status" aria-live="polite" data-testid="status-reset-password">
        <CheckCircle2 size={32} aria-hidden="true" />
        <p className="auth-reset-success">Password reset instructions have been sent to your email.</p>
        <p className="auth-demo-note" data-testid="notice-forgot-password">Demo only — no real email was sent, and your password was not changed.</p>
      </div> : <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="auth-form" noValidate data-testid="form-forgot-password">
          <FormField control={form.control} name="email" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Email address</FormLabel>
            <FormControl><div className="auth-input-wrap"><Mail className="auth-input-icon" size={19} aria-hidden="true" /><Input {...field} id="forgot-password-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="auth-input" data-testid="input-forgot-password-email" /></div></FormControl>
            <FormMessage className="auth-error" data-testid="error-forgot-password-email" />
          </FormItem>} />
          <p className="auth-demo-note" role="note" data-testid="notice-forgot-password">Demo only. No real email is sent.</p>
          <Button type="submit" className="auth-submit" data-testid="button-reset-password" disabled={form.formState.isSubmitting}>
            Send Reset Link <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      </Form>}
      <button type="button" className="auth-reset-back" onClick={() => setLocation("/login")} data-testid="button-forgot-password-back">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Login
      </button>
    </section>
  </AuthBackdrop>;
}

export function Register({ onAuthenticated }: AuthProps) {
  const [, setLocation] = useLocation();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", age: "", gender: "" },
    mode: "onTouched",
  });
  const submit = (values: z.infer<typeof registerSchema>) => {
    const profile: DemoProfile = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      age: Number(values.age),
      gender: values.gender,
    };
    localStorage.setItem("gvan-demo-profile", JSON.stringify(profile));
    onAuthenticated(profile);
    setLocation("/");
  };

  return <AuthBackdrop register>
    <section className="auth-card auth-card-register" aria-labelledby="auth-title" data-testid="panel-register">
      <div className="auth-card-heart auth-card-hearts" aria-hidden="true"><Heart size={29} strokeWidth={1.5} /><Heart size={25} strokeWidth={1.5} /></div>
      <p className="auth-card-eyebrow">Your space starts here</p>
      <h2 id="auth-title">Create Account</h2>
      <p className="auth-card-subtitle">A few details, then you’re in.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="auth-form auth-register-form" noValidate data-testid="form-register">
          <FormField control={form.control} name="fullName" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Full name</FormLabel>
            <FormControl><div className="auth-input-wrap"><UserRound className="auth-input-icon" size={19} aria-hidden="true" /><Input {...field} id="register-name" autoComplete="name" placeholder="Your name" className="auth-input" data-testid="input-register-name" /></div></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-name" />
          </FormItem>} />
          <FormField control={form.control} name="email" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Email address</FormLabel>
            <FormControl><div className="auth-input-wrap"><Mail className="auth-input-icon" size={19} aria-hidden="true" /><Input {...field} id="register-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="auth-input" data-testid="input-register-email" /></div></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-email" />
          </FormItem>} />
          <FormField control={form.control} name="password" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Password</FormLabel>
            <FormControl><PasswordInput field={field} testId="input-register-password" /></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-password" />
          </FormItem>} />
          <FormField control={form.control} name="confirmPassword" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Confirm password</FormLabel>
            <FormControl><PasswordInput field={field} testId="input-register-confirm-password" placeholder="Re-enter your password" /></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-confirm-password" />
          </FormItem>} />
          <FormField control={form.control} name="age" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Age</FormLabel>
            <FormControl><div className="auth-input-wrap"><CalendarDays className="auth-input-icon" size={19} aria-hidden="true" /><Input {...field} id="register-age" type="number" inputMode="numeric" min={18} max={120} step={1} placeholder="Enter your age" className="auth-input" data-testid="input-register-age" /></div></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-age" />
          </FormItem>} />
          <FormField control={form.control} name="gender" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Gender</FormLabel>
            <FormControl><div className="auth-input-wrap">
              <VenusAndMars className="auth-input-icon" size={19} aria-hidden="true" />
              <select {...field} id="register-gender" className="auth-input auth-native-select" data-testid="input-register-gender">
                <option value="" disabled>Select gender</option>
                {genderOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <ChevronDown className="auth-select-chevron" size={19} aria-hidden="true" />
            </div></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-gender" />
          </FormItem>} />
          <p className="auth-demo-note" role="note" data-testid="notice-demo-register">Demo only — not secure authentication. Registration details are kept in this browser; your password is never saved or sent.</p>
          <Button type="submit" className="auth-submit" data-testid="button-register-submit" disabled={form.formState.isSubmitting}>
            Create my space <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      </Form>
      <p className="auth-bottom-prompt">Already have a space? <Link href="/login" data-testid="link-register-to-login">Log in</Link></p>
    </section>
  </AuthBackdrop>;
}
